<?php
/**
 * API Webservice for Shopper
 *
 * Call the web service and send the parameters as GET request.
 * To call a function set the GET parameter 'cmd' to the desired function name.
 * Correct parameters 'email' and 'password' must be given for every request.
 *
 * Example: http://localhost/shopper/api/?cmd=is_login_valid&email=abc&password=abc
 *
 * @author Daniel Geymayer
 * @version 1.0
 * @copyright 2014-07-18
 */
class ShopperAPI {

    // Database handler
    private $db;
    private $unix_timestamp;

    /**
	 * Not a callable function, initializes API
	 * @param string $cmd Function name, see below
	 */
    function __construct() {
        if (isset($_GET['cmd'])) {
            $cmd = $_GET['cmd'];
            $this->db = new SQLite3('shopper.db');
            $this->unix_timestamp = time();

            $cmds_no_valid_login_required = array('is_login_valid', 'login_exists', 'register_user', 'get_user_by_email');
            $response = (in_array($cmd, $cmds_no_valid_login_required) OR $this->is_login_valid()) ?
                        $this->$cmd() :
                        $response = "Authentication failed! Parameters 'username' and/or 'password' incorrect or not set!";
        } else {
            $response = "Required GET parameter 'cmd' not found.";
        }
        if ($response === TRUE OR $response === FALSE) {
            $response_new = array();
            $response_new['result'] = $response;
            $response = $response_new;
        }

        // Send JSON data back to client
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        echo json_encode($response);
    }

    // =============== //
    // API starts here //
    // =============== //

    // USER
    /**
	 * Checks if the given login data is valid
	 * @param string $email E-mail-address
	 * @param string $password Password in plaintext
	 * @return object
	 */
    function is_login_valid($email = NULL, $password = NULL) {
        extract($this->get_params(array('email', 'password')));
        $sql = "SELECT COUNT(*) FROM user WHERE email = '$email' AND password = '$password'";
        $count = $this->fetch_value($sql);
        return $count > 0;
    }

    /**
	 * Creates a new user
	 * @param string $email E-mail-address
	 * @param string $password Password in plaintext
	 * @return object
	 */
    function register_user($email = NULL, $password = NULL, $name = NULL) {
        extract($this->get_params(array('email', 'password', 'name')));
        $sql = "INSERT INTO user ('email', 'password', 'name', 'created_at', 'modified_at') VALUES ('$email', '$password', '$name', $this->unix_timestamp, $this->unix_timestamp)";
        $bool = $this->db->exec($sql);

        if ($bool) {
            $_GET['user_id'] = $this->db->lastInsertRowID();
            $default_list_name = '';
            switch (substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2)) {
                case 'de':
                    $default_list_name = 'Einkaufsliste';
                    break;
                case 'en':
                default:
                    $default_list_name = 'Shopping list';
            }
            
            $_GET['name'] = $default_list_name;
            return $this->add_list();
        }
        return $bool;
    }

    /**
	 * Check if a user with a given e-mail address exists
	 * @param string $email E-mail-address
	 * @return object
	 */
    function login_exists($email = NULL) {
        extract($this->get_params(array('email')));
        $sql = "SELECT COUNT(*) FROM user WHERE email = '$email'";
        $count = $this->fetch_value($sql);
        return $count > 0;
    }
    function get_user($user_id = NULL) {
        extract($this->get_params(array('user_id')));
        $sql = "SELECT * FROM user WHERE id = '$user_id'";
        return $this->fetch_row($sql);
    }
    function get_user_by_email($email = NULL) {
        extract($this->get_params(array('email')));
        $sql = "SELECT * FROM user WHERE email = '$email'";
        return $this->fetch_row($sql);
    }
    function get_all_users() {
        $sql = "SELECT * FROM user";
        return $this->fetch_all($sql);
    }
    function search_user_by_name($name = NULL) {
        extract($this->get_params(array('name')));
        $sql = "SELECT * FROM user WHERE name = '$name'";
        return $this->fetch_all($sql);
    }
    function get_friends_of_user($user_id = NULL) {
        extract($this->get_params(array('user_id')));
        $sql = "SELECT * FROM friend WHERE user_id = '$user_id'";
        return $this->fetch_all($sql);
    }
    function search_users($query = NULL) {
        extract($this->get_params(array('query')));
        $sql = ""
            . "SELECT * "
            . "FROM user "
            . "WHERE name LIKE '%$query%' "
            . "OR email LIKE '%$query%' "
            . "LIMIT 5";
        return $this->fetch_all($sql);
    }

    // LIST
    function add_list($name = NULL, $user_id = NULL) {
        extract($this->get_params(array('name', 'user_id')));
        $sql = "INSERT INTO list ('name', 'created_by', 'created_at', 'modified_at') VALUES ('$name', '$user_id', $this->unix_timestamp, $this->unix_timestamp)";
        $list_was_created = $this->db->exec($sql);

        // Add user to list
        if ($list_was_created) {
            $_GET['list_id'] = $this->db->lastInsertRowID();
            return $this->add_user_to_list();
        }

        return $list_was_created;
    }
    function get_list($list_id = NULL) {
        extract($this->get_params(array('list_id')));
        $sql = "SELECT * FROM list WHERE id = '$list_id'";
        $list = $this->fetch_row($sql);

        $list['users'] = $this->get_users_of_list();

        return $list;
    }
    function get_users_of_list($list_id = NULL) {
        if (! isset($list_id)) {
            extract($this->get_params(array('list_id')));
        }
        $sql = ""
            . "SELECT u.* "
            . "FROM user u "
            . "INNER JOIN list_of_user lou ON (lou.user_id = u.id) "
            . "WHERE lou.list_id = '$list_id'";
        return $this->fetch_all($sql);
    }
    function get_lists_of_user($user_id = NULL) {
        extract($this->get_params(array('user_id')));
        $sql = "SELECT * FROM list_of_user WHERE user_id = '$user_id' ORDER BY position ASC";
        return $this->fetch_all($sql);
    }
    function get_lists_with_products_of_user($user_id = NULL, $hash = NULL) {
        extract($this->get_params(array('user_id', 'hash')));
        $sql = ""
            . "SELECT l.* "
            . "FROM list_of_user lof "
            . "INNER JOIN list l ON (lof.list_id = l.id) "
            . "WHERE user_id = '$user_id' "
            . "ORDER BY lof.position ASC";
        $lists = $this->fetch_all($sql);

        foreach ($lists as $key => $list) {
            $lists[$key]['products'] = $this->get_products_on_list($list['id']);
            $lists[$key]['users'] = $this->get_users_of_list($list['id']);
        }

        $lists_json_string = json_encode($lists, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        return ($hash === md5($lists_json_string)) ? NULL : $lists;
    }
    function add_user_to_list($user_id = NULL, $list_id = NULL) {
        extract($this->get_params(array('user_id', 'list_id')));
        
        $sql = "SELECT MAX(position) FROM list_of_user WHERE user_id = $user_id";
        $position = ((int) $this->fetch_value($sql)) + 1;
        
        $sql = "INSERT INTO list_of_user ('list_id', 'user_id', 'position', 'created_at', 'modified_at') VALUES ('$list_id', '$user_id', '$position', $this->unix_timestamp, $this->unix_timestamp)";
        $bool = $this->db->exec($sql);
        return $bool;
    }
    function unsubscribe_user_from_list($user_id = NULL, $list_id = NULL) {
        extract($this->get_params(array('user_id', 'list_id')));
        $sql = ""
            . "DELETE "
            . "FROM list_of_user "
            . "WHERE user_id = '$user_id' "
            . "AND list_id = '$list_id'";
        return $this->db->exec($sql);
    }
    function update_list($list_id = NULL, $name = NULL) {
        extract($this->get_params(array('list_id', 'name')));
        $sql = "UPDATE list SET name = '$name', modified_at = $this->unix_timestamp WHERE id = '$list_id'";
        return $this->db->exec($sql);
    }
    function add_product_to_list($product_id = NULL, $list_id = NULL, $comment = NULL) {
        extract($this->get_params(array('product_id', 'list_id', 'comment')));
        $sql = "INSERT INTO product_on_list ('product_id', 'list_id', 'comment', 'created_at', 'modified_at') VALUES ('$product_id', '$list_id', '$comment', $this->unix_timestamp, $this->unix_timestamp)";
        $success = $this->db->exec($sql);
        
        if (! $success) {
            $_GET['active'] = 1;
            $success2 = $this->change_active_state_of_product_from_list();
            $success3 = $this->change_comment();
            return $success2 AND $success3;
        }
        
        return $success;
    }
    function change_active_state_of_product_from_list($product_id = NULL, $list_id = NULL, $active = NULL) {
        extract($this->get_params(array('product_id', 'list_id', 'active')));
        $sql = "UPDATE product_on_list SET active = $active, modified_at = $this->unix_timestamp WHERE list_id = '$list_id' AND product_id = '$product_id'";
        return $this->db->exec($sql);
    }
    function move_list_one_position($list_id, $direction, $user_id) {
        extract($this->get_params(array('list_id', 'direction', 'user_id')));
        $sql = "SELECT position FROM list_of_user WHERE list_id = '$list_id' AND user_id = '$user_id'";
        $position = (int) $this->fetch_value($sql);
        $new_position = $position + ((int) $direction);
        
        $sql = "UPDATE list_of_user SET position = '$position', modified_at = $this->unix_timestamp WHERE position = '$new_position' AND user_id = '$user_id'";
        $this->db->exec($sql);
        $sql = "UPDATE list_of_user SET position = '$new_position', modified_at = $this->unix_timestamp WHERE list_id = '$list_id' AND user_id = '$user_id'";
        $this->db->exec($sql);
    }

    // PRODUCT
    function get_product($product_id = NULL) {
        extract($this->get_params(array('product_id')));
        $sql = "SELECT * FROM product WHERE id = '$product_id'";
        return $this->fetch_row($sql);
    }
    function get_products_on_list($list_id = NULL) {
        if (! isset($list_id)) {
            extract($this->get_params(array('list_id')));
        }
        $sql = ""
            . "SELECT p.*, pol.* "
            . "FROM product_on_list pol "
            . "INNER JOIN product p ON (p.id = pol.product_id)"
            . "WHERE list_id = '$list_id' "
            . "ORDER BY p.category_id ASC, p.name ASC";
        return $this->fetch_all($sql);
    }
    function get_all_products($user_id = NULL, $hash = NULL) {
        extract($this->get_params(array('user_id', 'hash')));
        $sql = ""
            . "SELECT * "
            . "FROM product "
            . "WHERE created_by IS NULL "
            . "OR created_by = '$user_id' "
            . "ORDER BY category_id ASC, name ASC";
        $all_products = $this->fetch_all($sql);
        
        $all_products_sorted = array();
        foreach ($all_products as $product) {
            $array_of_sorted_key_values = array();
            $keys = array_keys($product);
            sort($keys);
            foreach ($keys as $key) {
                array_push($array_of_sorted_key_values, $product[$key]);
            }
            array_push($all_products_sorted, $array_of_sorted_key_values);
        }
        $all_products_sorted_json_string = json_encode($all_products_sorted, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $new_hash = md5($all_products_sorted_json_string);
        return ($hash === $new_hash) ? NULL : $all_products;
    }
    function get_all_products_created_by_user($user_id = NULL) {
        extract($this->get_params(array('user_id')));
        $sql = "SELECT * FROM product WHERE created_by = '$user_id'";
        return $this->fetch_all($sql);
    }
    function add_custom_product_to_list($name = NULL, $list_id = NULL, $user_id = NULL) {
        extract($this->get_params(array('name', 'user_id')));
        $sql = "INSERT INTO product ('name', 'created_by', 'created_at', 'modified_at') VALUES ('$name', '$user_id', $this->unix_timestamp, $this->unix_timestamp)";

        if ($this->db->exec($sql)) {
            $_GET['product_id'] = $this->db->lastInsertRowID();
            $_GET['comment'] = '';
            return $this->add_product_to_list();
        }
        return FALSE;
    }
    
    function change_comment($product_id = NULL, $list_id = NULL, $comment = NULL) {
        extract($this->get_params(array('product_id', 'list_id', 'comment')));
        $sql = "UPDATE product_on_list SET comment = '$comment', modified_at = $this->unix_timestamp WHERE product_id = '$product_id' AND list_id = '$list_id'";
        $this->db->exec($sql);
    }

    // CATEGORY
    function get_category($category_id = NULL) {
        extract($this->get_params(array('category_id')));
        $sql = "SELECT * FROM category WHERE id = '$category_id'";
        return $this->fetch_row($sql);
    }
    function get_all_categories() {
        $sql = "SELECT * FROM category";
        return $this->fetch_all($sql);
    }

    /**
	 * Returns the current server date and time
	 * @return string Timestamp [YYYY-MM-DD HH:MM:SS]
	 */
    function get_timestamp() {
        return date('Y-m-d H:i:s');
    }

    function get_params($params) {
        $array = array();
        foreach ($params as $param) {
            if (isset($_GET[$param])) {
                $array[$param] = $_GET[$param];
            } else {
                exit;
            }
        }
        return $array;
    }

    function fetch_all($sql) {
        $result = $this->db->query($sql);

        $rows = array();
        while($row = $result->fetchArray(SQLITE3_ASSOC)){
            $rows[] = $row;
        }

        return $rows;
    }
    function fetch_row($sql) {
        return $this->db->querySingle($sql, TRUE);
    }
    function fetch_value($sql) {
        return $this->db->querySingle($sql, FALSE);
    }
    
    function log($string) {
        file_put_contents('debug.log', "$string\n", FILE_APPEND);
    }
}

new ShopperAPI();
