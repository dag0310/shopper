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

    /**
	 * Not a callable function, initializes API
	 * @param string $cmd Function name, see below
	 */
    function __construct() {
        if (isset($_GET['cmd'])) {
            $cmd = $_GET['cmd'];
            $this->db = new SQLite3('shopper.db');

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
        $sql = "INSERT INTO user ('email', 'password', 'name') VALUES ('$email', '$password', '$name')";
        $bool = $this->db->exec($sql);

        if ($bool) {
            $_GET['user_id'] = $this->db->lastInsertRowID();
            $_GET['name'] = 'Shopping list';
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
        $sql = "INSERT INTO list ('name', 'created_by') VALUES ('$name', '$user_id')";
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
        $sql = "SELECT * FROM list_of_user WHERE user_id = '$user_id'";
        return $this->fetch_all($sql);
    }
    function get_lists_with_products_of_user($user_id = NULL) {
        extract($this->get_params(array('user_id')));
        $sql = ""
            . "SELECT l.* "
            . "FROM list_of_user lof "
            . "INNER JOIN list l ON (lof.list_id = l.id) "
            . "WHERE user_id = '$user_id'";
        $lists = $this->fetch_all($sql);

        foreach ($lists as $key => $list) {
            $lists[$key]['products'] = $this->get_products_on_list($list['id']);
            $lists[$key]['users'] = $this->get_users_of_list($list['id']);
        }

        return $lists;
    }
    function add_user_to_list($user_id = NULL, $list_id = NULL) {
        extract($this->get_params(array('user_id', 'list_id')));
        $sql = "INSERT INTO list_of_user ('list_id', 'user_id') VALUES ('$list_id', '$user_id')";
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
        $sql = "UPDATE list SET name = '$name' WHERE id = '$list_id'";
        return $this->db->exec($sql);
    }
    function add_product_to_list($product_id = NULL, $list_id = NULL) {
        extract($this->get_params(array('product_id', 'list_id')));
        $sql = "INSERT INTO product_on_list ('product_id', 'list_id') VALUES ('$product_id', '$list_id')";
        return $this->db->exec($sql);
    }
    function remove_product_from_list($product_id = NULL, $list_id = NULL) {
        extract($this->get_params(array('product_id', 'list_id')));
        $sql = "DELETE FROM product_on_list WHERE list_id = '$list_id' AND product_id = '$product_id'";
        return $this->db->exec($sql);
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
            . "SELECT p.* "
            . "FROM product_on_list pol "
            . "INNER JOIN product p ON (p.id = pol.product_id)"
            . "WHERE list_id = '$list_id'";
        return $this->fetch_all($sql);
    }
    function get_all_products($user_id = NULL) {
        extract($this->get_params(array('user_id')));
        $sql = ""
            . "SELECT * "
            . "FROM product "
            . "WHERE created_by IS NULL "
            . "OR created_by = '$user_id'";
        return $this->fetch_all($sql);
    }
    function get_all_products_created_by_user($user_id = NULL) {
        extract($this->get_params(array('user_id')));
        $sql = "SELECT * FROM product WHERE created_by = '$user_id";
        return $this->fetch_all($sql);
    }
    function add_custom_product_to_list($name = NULL, $list_id = NULL, $user_id = NULL) {
        extract($this->get_params(array('name', 'user_id')));
        $sql = "INSERT INTO product ('name', 'created_by') VALUES ('$name', '$user_id')";

        if ($this->db->exec($sql)) {
            $_GET['product_id'] = $this->db->lastInsertRowID();
            return $this->add_product_to_list();
        }
        return FALSE;
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
}

new ShopperAPI();
