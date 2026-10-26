var sqldb = require('../../config/dbconnect');
var dbutil = require(appRoot + '/utils/dbutils');
var moment = require('moment');



//multitesting api///

exports.submitvendorloginmdl = function (data, callback) {
    var cntxtDtls = "in submitvendorloginmdl";
    var QRY_TO_EXEC = `SELECT * from shop_list_t where shop_phone_number = ? and shop_password = ? and d_in='0'`
    var values = [data.number, data.password];
    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
            callback(err, results);
        });
    }
    else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
    }
};

// exports.getcurrentordersmdl = function (data, callback) {


//     var cntxtDtls = "in getcurrentordersmdl";

//     // Step 1: Parse the outer JSON string to an object
//     let userObj = JSON.parse(data.user_id); // { user_ids: "63,64,65,66,67,68,69,70,71" }

//     // Step 2: Split the string into an array of numbers
//     let userIds = userObj.user_ids.split(',').map(Number); // [63, 64, 65, ...]

//     // Step 3: Use in SQL query
//     var QRY_TO_EXEC = `
//       SELECT 
//         ca.category_name, ca.category_image, ca.category_ind,
//         o.location_name, o.customer_otp, o.order_status,
//         DATE_FORMAT(o.order_date,'%d/%m/%Y') as order_date,
//         o.order_id, o.id, o.item_count, o.total_saving_amount, o.coupon_amount,
//         o.delivery_charges, o.grand_total,o.total_amount, o.payment_type, o.payment_id,
//         o.accept_order_date_time, o.delivery_accepted_date_time, o.order_deliverd_date_time,
//         o.deliveryboy_pickup_time, o.delivery_address, o.order_instructions, o.delivery_boy_array,
//         o.order_cancel_msg, o.order_latitude, o.order_longitude, o.delivery_boy_latitude, 
//         o.delivery_boy_longitude, o.category_id, o.order_prepare_time, o.slot_timings, o.filter_name,
//         o.shop_id, s.shop_name, s.shop_phone_number, s.category_id, s.shop_address,
//         s.shop_latitude, s.shop_longitude, s.shop_image,o.prescription_image,
//         DATE_FORMAT(o.order_date_time,"%h:%i %p") AS order_time
//       FROM order_lst_t as o
//       JOIN category_tbl as ca ON ca.id = o.category_id
//       JOIN shop_list_t AS s ON s.id = o.shop_id
//       WHERE o.shop_id IN (?) AND o.order_status IN (0, 1, 2, 8) and o.slot_indication=0
//       ORDER BY o.id DESC
//     `;

//     let params = [userIds];

//     if (callback && typeof callback === "function") {
//         dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
//             callback(err, results);
//         });
//     } else {
//         return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
//     }
// };

//checking for completed //

exports.getcurrentordersmdl = function (data, callback) {

    var cntxtDtls = "in getcurrentordersmdl";
 var current_date = moment().utcOffset("+05:30").format("YYYY-MM-DD");
    // Step 1: Parse the outer JSON string to an object
    let userObj = JSON.parse(data.user_id); // { user_ids: "63,64,65,66,67,68,69,70,71" }

    // Step 2: Split the string into an array of numbers
    let userIds = userObj.user_ids.split(',').map(Number); // [63, 64, 65, ...]

    // Step 3: Use in SQL query
    var QRY_TO_EXEC = `
      SELECT 
        ca.category_name, ca.category_image, ca.category_ind,
        o.location_name, o.customer_otp, o.order_status,
        DATE_FORMAT(o.order_date,'%d/%m/%Y') as order_date,
            f.franchise_mobile_number,
            f.franchise_name,
        o.order_id, o.id, o.item_count, o.total_saving_amount, o.coupon_amount,
        o.total_item_gst_amount, o.delivery_charges_gst, o.packing_charges_gst,
        o.gstonplatform_fee, o.razorpay_gst,
        o.delivery_charges, o.grand_total, o.total_amount, o.payment_type, o.payment_id,
        o.accept_order_date_time, o.delivery_accepted_date_time, o.order_deliverd_date_time,
        o.deliveryboy_pickup_time, o.delivery_address, o.order_instructions, o.delivery_boy_array,
        o.order_cancel_msg, o.order_latitude, o.order_longitude, o.delivery_boy_latitude, 
        o.delivery_boy_longitude, o.category_id, o.order_prepare_time, o.slot_timings, o.filter_name,
        o.shop_id, s.shop_name, s.shop_phone_number, s.category_id, s.shop_address,
        s.shop_latitude, s.shop_longitude, s.shop_image, o.prescription_image,
        DATE_FORMAT(o.order_date_time,"%h:%i %p") AS order_time
      FROM order_lst_t as o
      JOIN category_tbl as ca ON ca.id = o.category_id
      JOIN shop_list_t AS s ON s.id = o.shop_id
        LEFT JOIN franchise_t AS f ON f.location_id = o.location_id
      WHERE o.shop_id IN (?)
        AND (
             o.order_status IN (0,1,2,8)
             OR (o.order_status = 3 AND DATE(o.order_date_time) =?)
        )
        AND o.slot_indication = 0
      ORDER BY o.id DESC
    `;

    let params = [userIds,current_date];

    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
            callback(err, results);
        });
    } else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
    }
};















exports.newgetorderdetailsmdl = function (data, callback) {

    if (!data || !data.orderid) {

        return callback(new Error("Invalid order ID"), null);
    }

    var cntxtDtls = "in newgetorderdetailsmdl";
    var QRY_TO_EXEC = `SELECT 
        
        o.customer_id, o.customer_name, o.customer_mobile_number, o.order_instructions,
         f.franchise_mobile_number,
            f.franchise_name,
        ca.category_name, ca.category_image, ca.category_ind, 
        os.*, o.category_id, o.admin_percentage, o.item_count, 
        o.actual_total_amount, o.delivery_boy_array, o.total_amount, 
        o.total_saving_amount, o.coupon_amount, o.delivery_charges, o.delivery_instruction,
        o.total_item_gst_amount, o.delivery_charges_gst, o.packing_charges_gst,
        o.gstonplatform_fee, o.razorpay_gst,
        o.grand_total, o.location_id, o.location_name, o.payment_type, 
        o.order_status, o.delivery_accepted_date_time, o.deliveryboy_pickup_time, 
        o.order_distance, o.ext_del_charge, o.franchise_payment_status, 
        o.shop_id, o.vendor_otp, o.vendor_payment_status, o.delivery_boy_salary_status, o.order_id As oredergenereteid,
        o.order_recieved_status, o.del_charges_status, 
        DATE_FORMAT(o.order_date, "%d/%m/%Y") AS order_date, 
        DATE_FORMAT(o.order_date_time,"%h:%i %p") AS order_time, o.prescription_image,
        o.id AS main_order_id
    FROM order_lst_t AS o  
    JOIN sub_orders_items_t AS os ON os.order_id = o.id  
    JOIN category_tbl AS ca ON ca.id = o.category_id
      LEFT JOIN franchise_t AS f ON f.location_id = o.location_id
    WHERE os.order_id = ? GROUP BY os.id;`;

    var values = [data.orderid];


    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
            if (err) {

            }
            callback(err, results);
        });
    } else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
    }
};

exports.updateorderstatusmdl = function (data, callback) {
    var cntxtDtls = "in updateorderstatusmdl";
    var current_date_time = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
    var QRY_TO_EXEC = `UPDATE order_lst_t SET order_status = ? ,vendor_reject_remarks=? ,accept_order_date_time=? WHERE order_status = 0 AND id = ?`;
    var values = [data.order_status, data.remarks, current_date_time, data.order_id];
    console.log(values , QRY_TO_EXEC)
    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
            if (err) {
            }
            callback(err, results);
        });
    } else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
    }
};

exports.getbillinginformationmdl = function (data, callback) {

    var cntxtDtls = "in getbillinginformationmdl";

    var fdate = data.f_date ? ` AND order_date >= ?` : "";
    var tdate = data.t_date ? ` AND order_date <= ?` : "";

    var values = [];
    values.push(data.shop_id); // 1st placeholder (for main query)

    if (data.f_date) values.push(data.f_date);
    if (data.t_date) values.push(data.t_date);

    values.push(data.sup_sub_ctgry_id); // 2nd placeholder (for discount subquery)
    if (data.f_date) values.push(data.f_date);
    if (data.t_date) values.push(data.t_date);

    values.push(data.sup_sub_ctgry_id); // 3rd placeholder (for vendor_discount subquery)
    if (data.f_date) values.push(data.f_date);
    if (data.t_date) values.push(data.t_date);

    values.push(data.sup_sub_ctgry_id); // 4th placeholder (for main query WHERE condition)
    if (data.f_date) values.push(data.f_date);
    if (data.t_date) values.push(data.t_date);

    var QRY_TO_EXEC = ` SELECT GROUP_CONCAT(oi.slno) as item_slno_arr, 
               GROUP_CONCAT(oi.order_id) as order_ir_arr,
               oi.ctgry_name,
               SUM(oi.wt_price) as total_amount,
               COUNT(oi.slno) as orders_count,
               SUM(oi.vendor_percentage) as total_vendor_percentage,
               oi.sup_sub_ctgry_id,
               oi.filter_one,
               oi.vendor_percentage,
               oi.sup_sub_ctgry_nm,
               (SELECT SUM(coupon_amt) 
                FROM app_order_lst_t 
                WHERE order_status=3 AND vendor_payment_status=0 
                      AND promo_type=1 
                      AND sup_sub_ctgry_id=? ${fdate} ${tdate}) as discountamount,
               (SELECT SUM(coupon_amt) 
                FROM app_order_lst_t 
                WHERE order_status=3 AND vendor_payment_status=0 
                      AND promo_type=2 
                      AND sup_sub_ctgry_id=? ${fdate} ${tdate}) as vendor_discountamount
        FROM app_orders_items_lst_t as oi 
        WHERE oi.sub_order_status=3 AND oi.vendor_payment_status=0 
              AND oi.sup_sub_ctgry_id=? ${fdate} ${tdate} 
        GROUP BY oi.vendor_percentage`;



    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
            if (err) {

            }
            callback(err, results);
        });
    } else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
    }
};


exports.updateshopstatusmdl = function (data, callback) {
   
    var cntxtDtls = "in getshoplistmdl";
    var QRY_TO_EXEC = `update shop_list_t set shop_active_status=? where id=? `;
    var values = [data.active_status, data.shop_id];

    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
            if (err) {
                // console.error("SQL Execution Error:", err);
            }
            callback(err, results);
        });
    } else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
    }
};


exports.updatevendorspasswordmdl = function (data, callback) {
    // console.log("Received Data:", data);
    var cntxtDtls = "in updatevendorspasswordmdl";
    var QRY_TO_EXEC = `update shop_list_t set shop_password=? where shop_phone_number=? `;
    var values = [data.newPassword, data.shop_phone_number];

    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
            if (err) {
                // console.error("SQL Execution Error:", err);
            }
            callback(err, results);
        });
    } else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
    }
};

exports.updatepromocodemdl = function (data, callback) {

    var cntxtDtls = "in updatepromocodemdl";
    var current_date_time = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
    var QRY_TO_EXEC = `  INSERT INTO coupon_code_t (
            location_id, location_name, shop_id, coupon_name, 
            coupon_description,  coupon_percentage, coupon_max_price_limit, i_ts,entry_by ) 
        VALUES (?,  ?, ?, ?, ?, ?, ?, ?,?);`;
    var values = [data.location_id, data.shopaddress, data.user_id, data.p_name, data.p_description, data.p_percentage, data.p_price_limit, current_date_time, data.user_id];

    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
            if (err) {
                // console.error("SQL Execution Error:", err);
            }
            callback(err, results);
        });
    } else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
    }
};



exports.getpromocodesmdl = function (data, callback) {
   
    var cntxtDtls = "in getpromocodesmdl";
    var QRY_TO_EXEC = ` SELECT * FROM coupon_code_t WHERE d_in='0' AND shop_id=? ORDER BY id DESC `;
    var values = [data.user_id];

    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
            if (err) {
              
            }
            callback(err, results);
        });
    } else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
    }
};

exports.deletepromocodemdl = function (data, callback) {
    
    var cntxtDtls = "in deletepromocodemdl";
    var QRY_TO_EXEC = ` update coupon_code_t set d_in=? where id=? `;
    var values = [1, data.id];

    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
            if (err) {
                // console.error("SQL Execution Error:", err);
            }
            callback(err, results);
        });
    } else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
    }
};



exports.promocodeactivemdl = function (data, callback) {

    var cntxtDtls = "in promocodeactivemdl";
    var QRY_TO_EXEC = ` update coupon_code_t set coupon_status=? where id=? `;
    var values = [data.status, data.id];
    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
            if (err) {
                // console.error("SQL Execution Error:", err);
            }
            callback(err, results);
        });
    } else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
    }
};


exports.getproductslistdatamdl = function (data, callback) {
    const read = require('../../utils/shop-items').createShopItemsReader(sqldb.MySQLConPool);
    read(data).then(results => callback(null, results), err => {
        console.error('[getproductslistdatamdl] Menu query failed:', err.code, err.message);
        callback(err, null);
    });
};
// exports.updateshopproductsmdl = function (data, callback) {

//     var cntxtDtls = "in updateshopproductsmdl";
//     if (!data.shop_id || !data.id) {
//         return callback(new Error("Missing required parameters: shop_id or id"), null);
//     }
//     var GET_TABLE_NAME_QRY = `SELECT shop_items_tb_nm FROM shop_list_t WHERE id = ?`;
//     dbutil.sqlinjection(sqldb.MySQLConPool, GET_TABLE_NAME_QRY, [data.shop_id], cntxtDtls, function (err, results) {
//         if (err) {

//             return callback(err, null);
//         }
//         if (!results || results.length === 0 || !results[0].shop_items_tb_nm) {
//             return callback(new Error("No valid table found for the given shop_id"), null);
//         }
//         var tableName = results[0].shop_items_tb_nm.trim();
//         // Ensure table name contains only valid characters (to prevent SQL injection)
//         if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
//             return callback(new Error("Invalid table name detected"), null);
//         }
//         var UPDATE_QRY = `UPDATE ${tableName} 
//                           SET item_name = ?, actual_price = ?, selling_price = ?, discount_percentage = ? ,discount_amount=?
//                           WHERE shop_id = ? AND id = ?`;
//         var values = [
//             data.item_name, data.actual_price, data.selling_price, data.discount_percentage, data.discount_amount, data.shop_id, data.id
//         ];

//         dbutil.sqlinjection(sqldb.MySQLConPool, UPDATE_QRY, values, cntxtDtls, function (err, updateResults) {
//             if (err) {

//                 return callback(err, null);
//             }
//             callback(null, updateResults);
//         });
//     });
// };


exports.updateshopproductsmdl = function (data, callback) {
    if (!data.edittasks?.length && !data.deletedItems?.length) {
        const write = require('../../utils/shop-items').createShopItemsWriter(sqldb.MySQLConPool);
        write(data).then(result => callback(null, result), err => callback(err, null));
        return;
    }

    var cntxtDtls = "in updateshopproductsmdl";

    if (!data.shop_id || !data.id) {
        return callback(new Error("Missing required parameters: shop_id or id"), null);
    }

    var GET_TABLE_NAME_QRY = `SELECT shop_items_tb_nm FROM shop_list_t WHERE id = ?`;

    dbutil.sqlinjection(sqldb.MySQLConPool, GET_TABLE_NAME_QRY, [data.shop_id], cntxtDtls, function (err, results) {

        if (err) return callback(err, null);

        if (!results || !results[0]?.shop_items_tb_nm) {
            return callback(new Error("No valid table found"), null);
        }

        var tableName = results[0].shop_items_tb_nm.trim();

        if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
            return callback(new Error("Invalid table name"), null);
        }

        // ✅ 1. UPDATE MAIN PRODUCT
        var UPDATE_QRY = `UPDATE ${tableName} 
            SET item_name = ?, actual_price = ?, selling_price = ?, 
                discount_percentage = ?, discount_amount = ?, item_description = ?, quantity_type = ?, item_gst = ?
            WHERE shop_id = ? AND id = ?`;

        var values = [
            data.item_name,
            data.actual_price,
            data.selling_price,
            data.discount_percentage,
            data.discount_amount,
            data.item_description,
            data.quantity_type,
            data.item_gst,
            data.shop_id,
            data.id
        ];
console.log(UPDATE_QRY, values , "vandana test")
        dbutil.sqlinjection(sqldb.MySQLConPool, UPDATE_QRY, values, cntxtDtls, function (err, updateResults) {

            if (err) return callback(err, null);

            // ✅ 2. HANDLE EXTRA ITEMS (IF EXISTS)
            if (!data.edittasks || data.edittasks.length === 0) {
                return callback(null, updateResults);
            }

            let fullQuery = '';
            let params = [];

            data.edittasks.forEach(task => {

                // 🔹 UPDATE EXISTING
                if (task.id) {
                    fullQuery += `
                        UPDATE shop_extra_items_t 
                        SET title = ?, food_type = ?, user_selection = ?, 
                            extra_item_name = ?, price = ?
                        WHERE id = ?;
                    `;

                    params.push(
                        task.title,
                        task.food_type,
                        task.user_selection,
                        task.extra_item_name,
                        task.price,
                        task.id
                    );
                }

                // 🔹 INSERT NEW
                else {
                    fullQuery += `
                        INSERT INTO shop_extra_items_t 
                        (item_id, category_id, shop_id, title, food_type, user_selection, extra_item_name, price, table_name) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                    `;

                    params.push(
                        data.id,
                        data.category_id,
                        data.shop_id,
                        task.title,
                        task.food_type,
                        task.user_selection,
                        task.extra_item_name,
                        task.price,
                        tableName
                    );
                }

            });

            // ✅ 3. DELETE REMOVED ITEMS (OPTIONAL)
            if (data.deletedItems && data.deletedItems.length > 0) {
                data.deletedItems.forEach(item => {
                    fullQuery += `DELETE FROM shop_extra_items_t WHERE id = ?;`;
                    params.push(item.id);
                });
            }

            // ✅ 4. EXECUTE ALL
            dbutil.sqlinjection(sqldb.MySQLConPool, fullQuery, params, cntxtDtls, function (err, extraResults) {

                if (err) return callback(err, null);

                callback(null, {
                    product: updateResults,
                    extraItems: extraResults
                });

            });

        });

    });
};


// exports.postmain_player_id = function (data, callback) {
// console.log(data,'482')
// 	var cntxtDtls = "in postmain_player_id";
// 	var QRY_TO_EXEC = `INSERT INTO player_ids_list_t (player_id,user_type,user_id) VALUES (?,?,?) `;
// 	let paramsdata = [data.player_id,1,data.usr_id];
// // 	console.log(QRY_TO_EXEC , paramsdata)
// 	if (callback && typeof callback === "function") {
// 		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, paramsdata, cntxtDtls, function (err, results) {
// 			callback(err, results);
// 		});
// 	}
// 	else {
// 		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, paramsdata, cntxtDtls);
// 	}
// };


// exports.postmain_player_id = function (data, callback) {

//     var cntxtDtls = "in postmain_player_id";

//     const checkQuery = `SELECT id FROM player_ids_list_t WHERE player_id = ? AND user_type = ? AND user_id = ?`;
//     const checkParams = [data.player_id, 1, data.usr_id];

//     if (callback && typeof callback === "function") {
//         dbutil.sqlinjection(sqldb.MySQLConPool, checkQuery, checkParams, cntxtDtls, function (err, results) {
//             if (err) return callback(err);

//             if (results.length > 0) {
//                 // Record already exists â€” don't insert again
//                 return callback(null, { message: "Already Exists", inserted: false });
//             } else {
//                 // Proceed with Insert
//                 const insertQuery = `INSERT INTO player_ids_list_t (player_id, user_type, user_id) VALUES (?, ?, ?)`;
//                 const insertParams = [data.player_id, 1, data.usr_id];

//                 dbutil.sqlinjection(sqldb.MySQLConPool, insertQuery, insertParams, cntxtDtls, function (err2, insertRes) {
//                     callback(err2, { ...insertRes, inserted: true });
//                 });
//             }
//         });
//     } else {
//         // If no callback, return a promise-style result
//         return dbutil.sqlinjection(sqldb.MySQLConPool, checkQuery, checkParams, cntxtDtls)
//             .then(results => {
//                 if (results.length > 0) return { message: "Already Exists", inserted: false };

//                 const insertQuery = `INSERT INTO player_ids_list_t (player_id, user_type, user_id) VALUES (?, ?, ?)`;
//                 const insertParams = [data.player_id, 1, data.usr_id];
//                 return dbutil.sqlinjection(sqldb.MySQLConPool, insertQuery, insertParams, cntxtDtls)
//                     .then(insertRes => ({ ...insertRes, inserted: true }));
//             });
//     }
// };

// exports.postmain_player_id = function (data, callback) {
//   console.log(data)
//     const cntxtDtls = "in postmain_player_id";

//     // Safely parse the stringified JSON from usr_id
//     let parsedUserObj;
//     try {
//         parsedUserObj = JSON.parse(data.usr_id); // e.g., { user_ids: "10" }
//         console.log(parsedUserObj)
//     } catch (e) {
//         if (callback && typeof callback === "function") {
//             return callback(new Error("Invalid usr_id format. Expecting stringified JSON."));
//         }
//         return;
//     }

//     const userIdRaw = parsedUserObj.user_ids || '';
//     const userIds = typeof userIdRaw === 'string' ? userIdRaw.split(',') : [userIdRaw];
//  console.log(userIds)
//     const promises = userIds.map(user_id => {
//         return new Promise((resolve, reject) => {
//             const checkQuery = `SELECT id FROM player_ids_list_t WHERE player_id = ? AND user_type = ? AND user_id = ?`;
//             const checkParams = [data.player_id, 1, user_id];

//             dbutil.sqlinjection(sqldb.MySQLConPool, checkQuery, checkParams, cntxtDtls, function (err, results) {
//                 if (err) return reject(err);

//                 if (results.length > 0) {
//                     return resolve({ user_id, inserted: false, message: 'Already Exists' });
//                 } else {
//                     const insertQuery = `INSERT INTO player_ids_list_t (player_id, user_type, user_id) VALUES (?, ?, ?)`;
//                     const insertParams = [data.player_id, 1, user_id];
// console.log(insertQuery,insertParams)
//                     dbutil.sqlinjection(sqldb.MySQLConPool, insertQuery, insertParams, cntxtDtls, function (err2, insertRes) {
//                         if (err2) return reject(err2);
//                         return resolve({ user_id, inserted: true });
//                     });
//                 }
//             });
//         });
//     });

//     Promise.all(promises)
//         .then(results => {
//             if (callback && typeof callback === "function") {
//                 callback(null, results);
//             }
//         })
//         .catch(err => {
//             if (callback && typeof callback === "function") {
//                 callback(err);
//             }
//         });
// };

exports.postmain_player_id = function (data, callback) {
    
    console.log(data)
  
    const cntxtDtls = "in postmain_player_id";

    // Handle usr_id safely
    let userIds = [];

    try {
        // Try parsing as JSON
        const parsed = JSON.parse(data.usr_id);

        if (parsed && typeof parsed === 'object' && parsed.user_ids) {
            const userIdRaw = parsed.user_ids;
            userIds = typeof userIdRaw === 'string' ? userIdRaw.split(',') : [userIdRaw];
        } else {
            throw new Error("Parsed value doesn't contain user_ids");
        }
    } catch (e) {
        // Fallback to treating usr_id as plain string (e.g. "53" or "53,54")
        userIds = data.usr_id.split(',');
    }



    const promises = userIds.map(user_id => {
        return new Promise((resolve, reject) => {
            const checkQuery = `SELECT id FROM player_ids_list_t WHERE player_id = ? AND user_type = ? AND user_id = ? ;`
            const checkParams = [data.player_id, 1, user_id];

            dbutil.sqlinjection(sqldb.MySQLConPool, checkQuery, checkParams, cntxtDtls, function (err, results) {
                if (err) return reject(err);

                if (results.length > 0) {
                    return resolve({ user_id, inserted: false, message: 'Already Exists' });
                } else {
                    const insertQuery = `INSERT INTO player_ids_list_t (player_id, user_type, user_id) VALUES (?, ?, ?)`;
                    const insertParams = [data.player_id, 1, user_id];

                   

                    dbutil.sqlinjection(sqldb.MySQLConPool, insertQuery, insertParams, cntxtDtls, function (err2, insertRes) {
                        if (err2) return reject(err2);
                        return resolve({ user_id, inserted: true });
                    });
                }
            });
        });
    });

    Promise.all(promises)
        .then(results => {
            if (callback && typeof callback === "function") {
                callback(null, results);
            }
        })
        .catch(err => {
            if (callback && typeof callback === "function") {
                callback(err);
            }
        });
};


exports.updateproductactivesmdl = function (data, callback) {
    const write = require('../../utils/shop-items').createShopItemsWriter(sqldb.MySQLConPool);
    write({shop_id: data.shop_id, id: data.id, active_status: data.active_status})
        .then(result => callback(null, result), err => callback(err, null));
};






exports.getpaymenthistory = function (data, callback) {
    var cntxtDtls = "in getpaymenthistory";
    let randomOTP = Math.floor(100000 + Math.random() * 900000);
    var QRY_TO_EXEC = `SELECT a.*, b.shop_name, b.shop_phone_number, b.location_id, b.category_id, 
           DATE_FORMAT(a.payment_date_time, '%Y-%m-%d') AS settlement_date_time 
    FROM vendor_payment_t AS a 
    LEFT JOIN shop_list_t AS b ON a.vendor_id = b.id 
    WHERE DATE(a.payment_date_time) BETWEEN ? AND ? 
    AND a.vendor_id = ?;`;
    let value = [data.f_date, data.t_date, data.shop_id]
    if (callback && typeof callback == "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
            callback(err, results);
            return;
        });
    }
    else
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

// exports.getuserssubcatgry = function (data, callback) {
// 	var cntxtDtls = "in getuserssubcatgry";
// 	let randomOTP = Math.floor(100000 + Math.random() * 900000);
// 	var QRY_TO_EXEC = `select * from shop_list_t where id=?;`;
// 	let value = [data.id]
// 	if (callback && typeof callback == "function") {
// 		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
// 			callback(err, results);
// 			return;
// 		});
// 	}
// 	else
// 		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
// };
exports.getuserssubcatgry = function (data, callback) {

    var cntxtDtls = "in getuserssubcatgry";
    // Step 1: Fetch shop details including category_id
    var QRY_TO_EXEC1 = "SELECT category_id, shop_items_tb_nm FROM shop_list_t WHERE id = ?";
    let value1 = [data.id];
    dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC1, value1, cntxtDtls, function (err, shopResults) {
        if (err || shopResults.length === 0) {

            return callback(err || "No shop data found");
        }
        let category_id = shopResults[0].category_id;
        let shop_items_tb_nm = shopResults[0].shop_items_tb_nm;
        // Step 2: Fetch category data
        var QRY_TO_EXEC2 = "SELECT * FROM category_tbl WHERE id = ?";
        let value2 = [category_id];
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC2, value2, cntxtDtls, function (err, categoryResults) {
            if (err) {

                return callback(err);
            }
            // Step 3: Fetch sub-category data
            var QRY_TO_EXEC3 = "SELECT * FROM sub_category_tbl WHERE category_id = ?";
            let value3 = [category_id];
            dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC3, value3, cntxtDtls, function (err, subCategoryResults) {
                if (err) {

                    return callback(err);
                }
                // Step 4: Fetch main filter data
                var QRY_TO_EXEC4 = "SELECT * FROM main_filter_tbl WHERE category_id = ?";
                let value4 = [category_id];
                dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC4, value4, cntxtDtls, function (err, mainFilterResults) {
                    if (err) {

                        return callback(err);
                    }
                    // Consolidate all data
                    let finalData = {
                        shopDetails: shopResults[0],
                        categoryDetails: categoryResults,
                        subCategoryDetails: subCategoryResults,
                        mainFilterDetails: mainFilterResults
                    };
                    callback(null, finalData);
                });
            });
        });
    });
};




// exports.additemsdetails = function (data, imageupload,callback) {
//     console.log("Received Data:", data);
//         var current_date_time = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
//     var cntxtDtls = "in additemsdetails";
//     var QRY_TO_EXEC = `INSERT INTO z_all_items_t (
//             category_id, category_name, sub_category_id, sub_category_name, 
//             item_name,  item_image, item_description, filter_one,actual_price,selling_price,discount_percentage,discount_amount,i_ts,u_ts ) 
//         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?);  `;
//     var values = [data.category_id,data.category_name,
//     data.subcategory_id,data.subCategory,data.itemName,
//     imageupload,data.itemDescription,data.filter,data.itemPrice,data.sellingPrice,data.discountPercentage,data.discountAmount,current_date_time,current_date_time];

//     if (callback && typeof callback === "function") {
//         dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
//             if (err) {
//                 // console.error("SQL Execution Error:", err);
//             }
//             callback(err, results);
//         });
//     } else {
//         return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
//     }
// };

exports.additemsdetails = function (data, imageupload, callback) {

    var current_date_time = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
    var cntxtDtls = "in additemsdetails";
    var QRY_TO_EXEC = `INSERT INTO z_all_items_t (
        category_id, category_name, sub_category_id, sub_category_name, 
        item_name, item_image, item_description, filter_one, actual_price, selling_price, 
        discount_percentage, discount_amount, i_ts, u_ts
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
    var values = [
        data.category_id,
        data.category_name,
        data.subcategory_id,
        data.subCategory,
        data.itemName,
        imageupload,
        data.itemDescription,
        data.filter,
        data.itemPrice,
        data.sellingPrice,
        data.discountPercentage,
        data.discountAmount,
        current_date_time,
        current_date_time
    ];

    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
            if (err) {
                return callback(err, results);
            }
            const insertedItemId = results.insertId; // âœ… Get inserted item ID
            const dynamicTableName = data.table_name; // Ensure data.table_name is safe (validate before)
            var insertDynamicTableQuery = `
                INSERT INTO ${dynamicTableName} (
                    shop_id, item_id, category_id, category_name, sub_category_id, sub_category_name, 
                    item_name, item_image, item_description, filter_one, actual_price, selling_price, 
                    discount_percentage, discount_amount,i_ts
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            `;
            var dynamicValues = [
                data.shop_id,
                insertedItemId,
                data.category_id,
                data.category_name,
                data.subcategory_id,
                data.subCategory,
                data.itemName,
                imageupload,
                data.itemDescription,
                data.filter,
                data.itemPrice,
                data.sellingPrice,
                data.discountPercentage,
                data.discountAmount,
                current_date_time
            ];

            dbutil.sqlinjection(sqldb.MySQLConPool, insertDynamicTableQuery, dynamicValues, cntxtDtls, function (dynamicErr, dynamicResults) {
                if (dynamicErr) {
                    return callback(dynamicErr, dynamicResults);
                }
                return callback(null, { z_all_items_t: results, dynamicTable: dynamicResults });
            });
        });
    } else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
    }
};


exports.getdeliveryplayeridsMdl = function (data, callback) {
    var cntxtDtls = "in getdeliveryplayeridsMdl";

    var QRY_TO_EXEC = `SELECT player_id FROM player_ids_list_t WHERE location_id=? AND user_type=2`;


    var values = [data.location_id]; // Ensure correct order of values
    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
            if (err) {
                // console.error("SQL Execution Error:", err);
            }
            callback(err, results);
        });
    } else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
    }
};

exports.addsupportfromvendor = function (data, callback) {
    var current_date_time = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
    var cntxtDtls = "in addsupportfromvendor";
    var QRY_TO_EXEC = `INSERT INTO support (category,subcategory,description,shop_id,phone_number,shop_name,i_ts,location_id) VALUES (?,?,?,?,?,?,?,?) `;
    let paramsdata = [data.category, data.subcategory, data.description, data.shop_id, data.phone_number, data.shop_name, current_date_time,data.location_id];
  
    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, paramsdata, cntxtDtls, function (err, results) {
            callback(err, results);
        });
    }
    else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, paramsdata, cntxtDtls);
    }
};





// exports.getshopidsdata = function (data, callback) {
//     console.log(data);  // Now shows: { user_ids: [63, 64, 65, ...] }

//     let userIds = [];

//     if (Array.isArray(data.user_ids)) {
//         userIds = data.user_ids.filter(id => !isNaN(parseInt(id)));
//     }

//     if (userIds.length === 0) {
//         return callback(new Error("No valid user IDs provided"), null);
//     }

//     let placeholders = userIds.map(() => '?').join(', ');
//     let QRY_TO_EXEC = `SELECT * FROM shop_list_t WHERE id IN (${placeholders})`;

//     if (callback && typeof callback === "function") {
//         dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, userIds, "in getshopidsdata", function (err, results) {
//             callback(err, results);
//         });
//     } else {
//         return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, userIds, "in getshopidsdata");
//     }
// };





exports.getshopidsdata = function (data, callback) {


    var cntxtDtls = "in getshopidsdata";

    // // Step 1: Parse the outer JSON string to an object
    // let userObj = JSON.parse(data.user_id); // { user_ids: "63,64,65,66,67,68,69,70,71" }

    // // Step 2: Split the string into an array of numbers
    // let userIds = userObj.user_ids.split(',').map(Number); // [63, 64, 65, ...]

    // Step 3: Use in SQL query
    var QRY_TO_EXEC = `
    SELECT * FROM shop_list_t WHERE id IN (?)
    `;

    let params = [data.user_id];

    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
            callback(err, results);
        });
    } else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
    }
};


exports.getshoplistmdl = function (data, callback) {

    var cntxtDtls = "in getshoplistmdl";
    let userObj = JSON.parse(data.user_id); // { user_ids: "63,64,65,66,67,68,69,70,71" }

    // Step 2: Split the string into an array of numbers
    let userIds = userObj.user_ids.split(',').map(Number); // [63, 64, 65, ...]

    var QRY_TO_EXEC = `select * from shop_list_t where d_in='0' and id IN (?)`;
    var values = [userIds];

    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
            if (err) {
                // console.error("SQL Execution Error:", err);
            }
            callback(err, results);
        });
    } else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
    }
};




exports.getcurrentordersbyidCmdl = function (data, callback) {

    var cntxtDtls = "in getcurrentordersbyidCmdl";
    var QRY_TO_EXEC = `
    SELECT 
      ca.category_name, ca.category_image, ca.category_ind,
      o.location_name, o.customer_otp, o.order_status,
      DATE_FORMAT(o.order_date,'%d/%m/%Y') as order_date,
      o.order_id, o.id, o.item_count, o.total_saving_amount, o.coupon_amount,
      o.delivery_charges, o.grand_total, o.payment_type, o.payment_id,
      o.accept_order_date_time, o.delivery_accepted_date_time, o.order_deliverd_date_time,
      o.deliveryboy_pickup_time, o.delivery_address, o.order_instructions, o.delivery_boy_array,
      o.order_cancel_msg, o.order_latitude, o.order_longitude, o.delivery_boy_latitude, 
      o.delivery_boy_longitude, o.category_id, o.order_prepare_time, o.slot_timings, o.filter_name,
      o.shop_id, s.shop_name, s.shop_phone_number, s.category_id, s.shop_address,
      s.shop_latitude, s.shop_longitude, s.shop_image,
      DATE_FORMAT(o.order_date_time,"%h:%i %p") AS order_time
    FROM order_lst_t as o
    JOIN category_tbl as ca ON ca.id = o.category_id
    JOIN shop_list_t AS s ON s.id = o.shop_id
    WHERE o.shop_id IN (?) AND o.order_status IN (0, 1, 2, 8) and o.slot_indication=0
    ORDER BY o.id DESC
  `;

    let params = [data.shop_id];


    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
            callback(err, results);
        });
    } else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
    }
};


// exports.getshopsforpaymentsmdl = function (data, callback) {
//     console.log(data,'938')
//     var cntxtDtls = "in getshopsforpaymentsmdl";
//     let userIds = [];

//     // Handle user_id being either a number or a JSON string
//     if (typeof data.user_id === "string") {
//         try {
//             let parsed = JSON.parse(data.user_id);
//             if (parsed.user_ids) {
//                 userIds = parsed.user_ids.split(',').map(Number);
//             } else {
//                 userIds = [Number(data.user_id)];
//             }
//         } catch (e) {
//             // Not JSON, assume it's a stringified number
//             userIds = [Number(data.user_id)];
//         }
//     } else if (typeof data.user_id === "number") {
//         userIds = [data.user_id];
//     }

//     // Safety check to ensure userIds is not empty
//     if (!userIds.length || userIds.some(isNaN)) {
//         return callback(new Error("Invalid user_id format"), null);
//     }

   

// // const QRY_TO_EXEC =`SELECT a.id, a.vendor_payment_otp,a.tcs,a.tds,a.onetimefee,a.admin_percentage,a.banner_promotion,a.ad_promotion,a.freshozapcart_offer,SUM(b.coupon_amount) as coupon_amount,SUM((b.admin_percentage / 100) * (b.total_amount + b.packing_charges - b.coupon_amount)) AS admin_service_fee,SUM(b.delivery_charges) AS delivery_charges,SUM(b.handling_charges) AS platform_fee,SUM(b.razorpay_charges) AS paymentgateway_charges, SUM((b.admin_percentage / 100) * b.grand_total + b.delivery_charges + b.handling_charges + b.razorpay_charges) AS B_value,SUM(b.total_item_gst_amount) AS item_amount_gst,CONCAT(a.shop_name, ' (', a.shop_phone_number, ')') AS shop_info, a.shop_image, COUNT(b.id) AS total_orders, CONCAT(MIN(b.order_date), ' - ', MAX(b.order_date)) AS date_range, SUM(b.grand_total) AS customer_payable_A,SUM(b.total_amount + b.packing_charges + b.total_item_gst_amount - b.coupon_amount) AS A_value,SUM(b.total_amount + b.packing_charges - b.coupon_amount) AS fifth_value, SUM(b.total_amount) AS item_amount,SUM(CASE WHEN b.payment_type = 'Cash on Delivery' THEN b.grand_total ELSE 0 END) AS cod_amount,SUM(CASE WHEN b.payment_type = 'Pay Online' THEN b.grand_total ELSE 0 END) AS pay_online_amount, SUM(b.razorpay_charges) as online_charges, JSON_ARRAYAGG(b.id) AS order_ids,SUM(b.delivery_charges_gst) as total_delivery_gst,SUM(b.packing_charges_gst) as packing_charges_gst,SUM(b.razorpay_gst) as pg_charges_gst,SUM(b.coupon_amount) as merchant_offer,SUM(b.packing_charges) as packing_charges FROM shop_list_t AS a JOIN order_lst_t AS b ON a.id = b.shop_id WHERE a.d_in = '0' AND b.vendor_payment_status = 0 AND b.order_status = 3 AND b.shop_id IN (?)
// //      GROUP BY   a.id;`


//  const QRY_TO_EXEC =`SELECT a.id, a.vendor_payment_otp,a.tcs,a.tds,a.onetimefee,a.admin_percentage,a.banner_promotion,a.ad_promotion,a.freshozapcart_offer,SUM(b.coupon_amount) as coupon_amount,SUM((b.admin_percentage / 100) * (b.total_amount + b.packing_charges - b.coupon_amount)) AS admin_service_fee,SUM(b.delivery_charges) AS delivery_charges,SUM(b.handling_charges) AS platform_fee,SUM(b.razorpay_charges) AS paymentgateway_charges, SUM((b.admin_percentage / 100) * b.grand_total + b.delivery_charges + b.handling_charges + b.razorpay_charges) AS B_value,SUM(b.total_item_gst_amount) AS item_amount_gst,CONCAT(a.shop_name, ' (', a.shop_phone_number, ')') AS shop_info, a.shop_image, COUNT(b.id) AS total_orders, CONCAT(MIN(b.order_date), ' - ', MAX(b.order_date)) AS date_range, SUM(b.total_amount + b.packing_charges + b.total_item_gst_amount - b.coupon_amount) AS customer_payable_A,SUM(b.total_amount + b.packing_charges + b.total_item_gst_amount - b.coupon_amount) AS A_value,SUM(b.total_amount + b.packing_charges - b.coupon_amount) AS fifth_value, SUM(b.total_amount) AS item_amount,SUM(CASE WHEN b.payment_type = 'Cash on Delivery' THEN b.grand_total ELSE 0 END) AS cod_amount,SUM(CASE WHEN b.payment_type = 'Pay Online' THEN b.grand_total ELSE 0 END) AS pay_online_amount, SUM(b.razorpay_charges) as online_charges, JSON_ARRAYAGG(b.id) AS order_ids,SUM(b.delivery_charges_gst) as total_delivery_gst,SUM(b.packing_charges_gst) as packing_charges_gst,SUM(b.razorpay_gst) as pg_charges_gst,SUM(b.coupon_amount) as merchant_offer,SUM(b.packing_charges) as packing_charges FROM shop_list_t AS a JOIN order_lst_t AS b ON a.id = b.shop_id WHERE a.d_in = '0' AND b.vendor_payment_status = 0 AND b.order_status = 3 AND b.shop_id IN (?)
//       GROUP BY   a.id;`

//     let params = [userIds];
// console.log(QRY_TO_EXEC,params,'974')
//     if (callback && typeof callback == "function") {
//         dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
//             callback(err, results);
//         });
//     } else {
//         return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
//     }
// };





exports.getshopsforpaymentsmdl = function (data, callback) {
    console.log(data, '938');
    var cntxtDtls = "in getshopsforpaymentsmdl";
    let userIds = [];

    // Handle user_id being either a number or a JSON string
    if (typeof data.user_id === "string") {
        try {
            let parsed = JSON.parse(data.user_id);
            if (parsed.user_ids) {
                userIds = parsed.user_ids.split(',').map(Number);
            } else {
                userIds = [Number(data.user_id)];
            }
        } catch (e) {
            // Not JSON, assume it's a stringified number
            userIds = [Number(data.user_id)];
        }
    } else if (typeof data.user_id === "number") {
        userIds = [data.user_id];
    }

    if (!userIds.length || userIds.some(isNaN)) {
        return callback(new Error("Invalid user_id format"), null);
    }

    const QRY_TO_EXEC = `
        SELECT a.id, a.vendor_payment_otp,a.admin_percentage,a.commission_type,SUM(ROUND(CASE a.commission_type WHEN 0 THEN (a.admin_percentage / 100) * b.total_amount WHEN 1 THEN a.admin_percentage ELSE NULL END, 2)) AS admin_service_fee,CONCAT(a.shop_name, ' (', a.shop_phone_number, ')') AS shop_info, a.shop_image, COUNT(b.id) AS total_orders, CONCAT(MIN(b.order_date), ' - ', MAX(b.order_date)) AS date_range, SUM(b.total_amount) AS item_amount,  JSON_ARRAYAGG(b.id) AS order_ids,SUM(b.packing_charges) as packing_charges FROM shop_list_t AS a JOIN order_lst_t AS b ON a.id = b.shop_id WHERE a.d_in = '0' AND b.vendor_payment_status = 0 AND b.order_status = 3 AND b.shop_id IN (?)
        ;
    `;

    // ✅ flatten the array
    let params = [userIds]; // <== only if sqlinjection expands arrays properly
    // Or just:
    // let params = userIds;

    console.log(QRY_TO_EXEC, params, '974');

    if (callback && typeof callback == "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
            callback(err, results);
        });
    } else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
    }
};













// exports.getdashboardordersmdl = function (data, callback) {
//   console.log(data)
//     var cntxtDtls = "in getdashboardordersmdl";
//     let userObj = JSON.parse(data.user_id);
//     let userIds = userObj.user_ids.split(',').map(Number);
//   console.log(userIds)
//     var QRY_TO_EXEC = `SELECT f.franchise_name,  f.franchise_mobile_number,
//   o.*, DATE_FORMAT(o.order_date_time, "%h:%i") AS order_time,  ca.category_name, ca.category_image, ca.category_ind
// FROM  order_lst_t AS o  JOIN shop_list_t AS sl on sl.id=o.shop_id
// JOIN franchise_t AS f ON f.location_id = o.location_id  JOIN category_tbl AS ca ON ca.id = o.category_id
// WHERE  o.shop_id IN (?)  AND DATE(o.order_date_time) BETWEEN ? AND ?; `;
//     var values = [userIds, data.f_date, data.t_date];
//     console.log(QRY_TO_EXEC,values)
   
//     if (callback && typeof callback === "function") {
//         dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {

//             if (err) {
//                 // console.error("SQL Execution Error:", err);
//             }
//             callback(err, results);
//         });
//     } else {
//         return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
//     }
// };

exports.getdashboardordersmdl = function (data, callback) {

  const cntxtDtls = "in getdashboardordersmdl";

  let userIds = [];

  try {
    const userObj = JSON.parse(data.user_id);
    userIds = userObj.user_ids.split(',').map(id => parseInt(id.trim(), 10));
  } catch (e) {
 
    userIds = [];
  }



  // Dynamically generate placeholders (?, ?, ?, ...)
  const placeholders = userIds.map(() => '?').join(',');

  const QRY_TO_EXEC = `
   
         select o.*, DATE_FORMAT(o.order_date_time, "%h:%i %p") AS order_time,
           ca.category_name, ca.category_image, ca.category_ind,sl.shop_name
    FROM order_lst_t AS o
    JOIN shop_list_t AS sl ON sl.id = o.shop_id
    JOIN franchise_t AS f ON f.location_id = o.location_id
    JOIN category_tbl AS ca ON ca.id = o.category_id
    WHERE o.shop_id IN (?)
      AND DATE(o.order_date_time) BETWEEN ? AND ?;
  `;

  const values = [data.shop_id, data.f_date, data.t_date];
 

  if (callback && typeof callback === "function") {
    dbutil.sqlinjection(
      sqldb.MySQLConPool,
      QRY_TO_EXEC,
      values,
      cntxtDtls,
      function (err, results) {
        callback(err, results);
      }
    );
  } else {
    return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
  }
};



// exports.getdateresultsbydate = function (data, callback) {
//     console.log(data,'2055')
//   var cntxtDtls = "in getdateresultsbydate";
//   let shopIds = [];

//   try {
//     // If it's a JSON string, parse it
//     let parsed = typeof data.shop_id === 'string' && data.shop_id.includes('{')
//       ? JSON.parse(data.shop_id)
//       : { user_ids: data.shop_id };

//     // Expecting comma-separated string in user_ids
//     if (typeof parsed.user_ids === 'string') {
//       shopIds = parsed.user_ids.split(',').map(id => parseInt(id.trim(), 10));
//     } else {
//       // Fallback in case it's a single number
//       shopIds = [parseInt(parsed.user_ids, 10)];
//     }

//   } catch (e) {
//     // Fallback for plain number input
//     shopIds = [parseInt(data.shop_id, 10)];
//   }



//   const placeholders = shopIds.map(() => '?').join(',');
//   const QRY_TO_EXEC = `o.*, DATE_FORMAT(o.order_date_time, "%h:%i %p") AS order_time,
//           ca.category_name, ca.category_image, ca.category_ind,sl.shop_name
//     FROM order_lst_t AS o JOIN shop_list_t AS sl ON sl.id=o.shop_id
//     JOIN franchise_t AS f ON f.location_id = o.location_id
//     JOIN category_tbl AS ca ON ca.id = o.category_id
//     WHERE o.shop_id IN (${placeholders})
//       AND DATE(o.order_date_time) BETWEEN ? AND ?;
//   `;

//   const values = [ data.f_date, data.t_date];
//  console.log(QRY_TO_EXEC,values,'2090')

//   if (callback && typeof callback === "function") {
//     dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
//       callback(err, results);
//     });
//   } else {
//     return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
//   }
// };

exports.getdateresultsbydate = function (data, callback) {

  var cntxtDtls = "in getdateresultsbydate";
  let shopIds = [];

  try {
    // If it's a JSON string, parse it
    let parsed = typeof data.shop_id === 'string' && data.shop_id.includes('{')
      ? JSON.parse(data.shop_id)
      : { user_ids: data.shop_id };

    if (typeof parsed.user_ids === 'string') {
      shopIds = parsed.user_ids.split(',').map(id => parseInt(id.trim(), 10));
    } else {
      shopIds = [parseInt(parsed.user_ids, 10)];
    }
  } catch (e) {
    shopIds = [parseInt(data.shop_id, 10)];
  }

  shopIds = shopIds.filter(id => !isNaN(id));

  if (shopIds.length === 0) {
    return callback({ status: 400, msg: "Invalid shop_id" }, null);
  }

  // ðŸ‘‡ placeholders from shopIds
  const placeholders = shopIds.map(() => '?').join(',');

  const QRY_TO_EXEC = `
    SELECT o.*, DATE_FORMAT(o.order_date_time, "%h:%i %p") AS order_time,
           ca.category_name, ca.category_image, ca.category_ind, sl.shop_name
    FROM order_lst_t AS o
    JOIN shop_list_t AS sl ON sl.id = o.shop_id
    JOIN franchise_t AS f ON f.location_id = o.location_id
    JOIN category_tbl AS ca ON ca.id = o.category_id
    WHERE o.shop_id IN (${placeholders})
      AND DATE(o.order_date_time) BETWEEN ? AND ?;
  `;

  // ðŸ‘‡ first shopIds, then dates
  const values = [...shopIds, data.f_date, data.t_date];

  if (callback && typeof callback === "function") {
    dbutil.sqlinjection(
      sqldb.MySQLConPool,
      QRY_TO_EXEC,
      values,
      cntxtDtls,
      function (err, results) {
        callback(err, results);
      }
    );
  } else {
    return dbutil.sqlinjection(
      sqldb.MySQLConPool,
      QRY_TO_EXEC,
      values,
      cntxtDtls
    );
  }
};

exports.extraitems = function (data, callback) {
    var cntxtDtls = "in extraitems";
    var QRY_TO_EXEC = `SELECT * from extraitem_title_t where  category_id = ? and d_in='0'`
    var values = [data.category_id];

    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
            callback(err, results);
        });
    }
    else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
    }
};


exports.getextaritemsdata = function (data, callback) {
    var cntxtDtls = "in getextaritemsdata";
    var QRY_TO_EXEC = `SELECT * from shop_extra_items_t where  category_id = ? and item_id=? and shop_id=? and d_in='0'`
    var values = [data.category_id, data.item_id, data.shop_id];
    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
            callback(err, results);
        });
    }
    else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
    }
};

exports.updateshopitemsWithoutTasks = function (data, callback) {
    const cntxtDtls = "in updateshopitemsWithoutTasks";
   
    const sanitizedItemName = sanitizeItemName(data.item_name).substring(0, 10);
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const uniquecode = `${sanitizedItemName}-${randomNumber}`;

    const QRY_TO_EXEC = `
    UPDATE ${data.table_name} SET 
      category_id = ?, category_name = ?, sub_category_id = ?, sub_category_name = ?,
      item_name = ?, item_description = ?, full_description = ?, filter_one = ?, actual_price = ?, 
      selling_price = ?, discount_percentage = ?, discount_amount = ?, quantity_varient = ?, 
      prescription_required = ?, item_gst = ? 
    WHERE id = ?;
  `;

    const params = [
        data.category_id,
        data.category_name,
        data.sub_category_id,
        data.sub_category_name,
        data.item_name,
        data.item_description,
        data.full_description || '',
        data.filter_one,
        data.actual_price,
        data.selling_price,
        data.discount_percentage,
        data.discount_amount,
        data.quantity_type,
        data.prescription_required,
        data.item_gst,
        data.id
    ];

    dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
        if (!err) {
            results.uniquecode = uniquecode;
        }
        callback(err, results);
    });
};


exports.updateshopitemsWithTasks = function (data, callback) {

    const cntxtDtls = "in updateshopitemsWithTasks";

    let quantityPrice = 0;

    const firstTask = data.tasks.find(task => task.title === "Quantity");
    if (firstTask.price) {
        quantityPrice = parseFloat(firstTask.price);
    }

    const increasedPrice = Math.round(quantityPrice * 1.3);
    const sanitizedItemName = sanitizeItemName(data.item_name).substring(0, 10);
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const uniquecode = `${sanitizedItemName}-${randomNumber}`;

    const QRY_TO_EXEC = `
    UPDATE ${data.table_name} SET 
      category_id = ?, category_name = ?, sub_category_id = ?, sub_category_name = ?, item_name = ?, 
      item_description = ?, full_description = ?, filter_one = ?, quantity_type = ?, 
      prescription_required = ?, item_gst = ?, actual_price = ?, selling_price = ? 
    WHERE id = ?;
  `;

    const params = [
        data.category_id,
        data.category_name,
        data.sub_category_id,
        data.sub_category_name,
        data.item_name,
        data.item_description,
        data.full_description || '',
        data.filter_one,
        data.quantity_type,
        data.prescription_required,
        data.item_gst,
        increasedPrice,
        quantityPrice,
        data.id
    ];
   
    dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
        if (err) {
           
        }
        callback(err, results);
    });
};
exports.updateshopextraitems = function (data, callback) {

    const cntxtDtls = "in updateshopextraitems";
    const variants = data.variants || [];

    let queryParts = [];
    let params = [];

    for (let i = 0; i < variants.length; i++) {
        const v = variants[i];

        if (v.id) {
            // Update if id is present
            queryParts.push(`
                UPDATE shop_extra_items_t SET
                    title = ?, food_type = ?, user_selection = ?, extra_item_name = ?, price = ?
                WHERE id = ? ;
            `);
            params.push(
                v.title,
                v.food_type,
                v.user_selection,
                v.extra_item_name,
                v.price,
                v.id,

            );
        } else {
            // Insert new if no id
            queryParts.push(`
                INSERT INTO shop_extra_items_t 
                (item_id, category_id, shop_id, title, food_type, user_selection, extra_item_name, price, table_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
            `);
            params.push(
                data.id,
                data.category_id,
                data.shop_id,
                v.title,
                v.food_type,
                v.user_selection,
                v.extra_item_name,
                v.price,
                data.table_name
            );
        }
    }

    const finalQuery = queryParts.join('\n');

    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(
            sqldb.MySQLConPool,
            finalQuery,
            params,
            cntxtDtls,
            function (err, results) {
                callback(err, results);
            }
        );
    } else {
        return dbutil.sqlinjection(
            sqldb.MySQLConPool,
            finalQuery,
            params,
            cntxtDtls
        );
    }
};


exports.updatedeletedshopitemsintasks = function (data, callback) {
    const cntxtDtls = "in updatedeletedshopitemsintasks";
    const deletedVariants = data.deleted_variants || [];

    if (deletedVariants.length === 0) {
        return callback(null, { msg: "No variants to delete" });
    }

    const ids = deletedVariants.map(v => v.id); // [2958, 1308, ...]

    // Generate placeholders (?, ?, ?) for SQL IN clause
    const placeholders = ids.map(() => '?').join(', ');
    const QRY_TO_EXEC = `UPDATE shop_extra_items_t SET d_in='1' WHERE d_in='0' AND id IN (${placeholders})`;

    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, ids, cntxtDtls, function (err, results) {
            callback(err, results);
        });
    } else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, ids, cntxtDtls);
    }
};







exports.addshopitemsinmaintbl = function (data, imageupload, callback) {

    var cntxtDtls = "in addshopitemsinmaintbl";
    var createddate = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");

    var QRY_TO_EXEC = `INSERT INTO z_all_items_t (category_id,category_name,sub_category_id,sub_category_name,item_name,item_description,item_image,filter_one,quantity_type,actual_price,selling_price,discount_percentage,discount_amount,unique_code,shop_items_tb_nm,entry_by,i_ts) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
    let params = [data.category_id, data.category_name, data.sub_category_id, data.sub_category_name, data.item_name, data.item_description, imageupload ||'', data.filter_one, data.quantity_type, data.actual_price, data.selling_price, data.discount_percentage, data.discount_amount, data.uniquecode, data.table_name, data.entry_by, createddate]

    if (callback && typeof callback == "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
            callback(err, results);
            return;
        });
    }
    else
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.addshopitemsWithoutTasks = function (data, imageupload, callback) {

    var cntxtDtls = "in addshopitemsWithoutTasks";

    const maxItemNameLength = 10;
    const sanitizedItemName = sanitizeItemName(data.item_name).substring(0, maxItemNameLength);
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const uniquecode = `${sanitizedItemName}-${randomNumber}`;

    var QRY_TO_EXEC = `INSERT INTO ${data.table_name} (shop_id,category_id,category_name,sub_category_id,sub_category_name,item_name,item_description,full_description,item_image,filter_one,actual_price,selling_price,discount_percentage,discount_amount,admin_percentage,location_id,quantity_type,unique_code,prescription_required,item_gst,entry_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
    let params = [data.shop_id, data.category_id, data.category_name, data.sub_category_id, data.sub_category_name, data.item_name, data.item_description, data.full_description || '', imageupload ||'', data.filter_one, data.actual_price, data.selling_price, data.discount_percentage, data.discount_amount, data.admin_percentage, data.location_id, data.quantity_type, uniquecode, data.prescription_required, data.item_gst, data.entry_by]

    if (callback && typeof callback == "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
            if (!err) {
                results.uniquecode = uniquecode;
            }
            callback(err, results);
            return;
        });
    }
    else
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

function sanitizeItemName(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();
}


exports.addshopitemsWithTasks = function (data, imageupload, callback) {

    var cntxtDtls = "in addshopitemsWithTasks";
    // 	const firstTaskPrice = (data && data.tasks && data.tasks[0] && data.tasks[0].price) || 0;
    // 	const increasedPrice = Math.round(firstTaskPrice * 1.3); 
    // 	const firstTaskPrice = data?.tasks?.find(task => task.title == "Quantity");
    // 	const quantityPrice = firstTaskPrice?.price || 0;
    let quantityPrice = 0;

    if (data && data.tasks && Array.isArray(data.tasks)) {
        const firstTaskPrice = data.tasks.find(function (task) {
            return task.title === "Quantity";
        });

        if (firstTaskPrice && firstTaskPrice.price) {
            quantityPrice = firstTaskPrice.price;
        }
    }
    const increasedPrice = Math.round(quantityPrice * 1.3);
    const maxItemNameLength = 10;
    const sanitizedItemName = sanitizeItemName(data.item_name).substring(0, maxItemNameLength);
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const uniquecode = `${sanitizedItemName}-${randomNumber}`;

    var QRY_TO_EXEC = `INSERT INTO ${data.table_name} (shop_id,category_id,category_name,sub_category_id,sub_category_name,item_name,item_description,full_description,item_image,filter_one,actual_price,selling_price,admin_percentage,location_id,quantity_type,unique_code,prescription_required,item_gst,entry_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
    let params = [data.shop_id, data.category_id, data.category_name, data.sub_category_id, data.sub_category_name, data.item_name, data.item_description, data.full_description, imageupload ||'', data.filter_one, increasedPrice, quantityPrice, data.admin_percentage, data.location_id, data.quantity_type, uniquecode, data.prescription_required, data.item_gst, data.entry_by]

    if (callback && typeof callback == "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
            callback(err, results);
            return;
        });
    }
    else
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.insertshopextraitems = function (Insertid, data, callback) {
  
    const cntxtDtls = "in insertshopextraitems";
    const variants = data.variants || [];
    let QRY_TO_EXEC = '';
    let MU_QRY_TO_EXEC = '';
    let params = [];
    for (let i = 0; i < variants.length; i++) {
        QRY_TO_EXEC = `INSERT INTO shop_extra_items_t 
            (item_id, category_id, shop_id, title, food_type, user_selection, extra_item_name, price, table_name) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        MU_QRY_TO_EXEC += QRY_TO_EXEC;
        params.push(
            Insertid,
            data.category_id,
            data.shop_id,
            variants[i].title,
            variants[i].food_type,
            variants[i].user_selection,
            variants[i].extra_item_name,
            variants[i].price,
            data.table_name
        );
    }
    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(
            sqldb.MySQLConPool,
            MU_QRY_TO_EXEC,
            params,
            cntxtDtls,
            function (err, results) {
                callback(err, results);
                return;
            }
        );
    } else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls);
    }
};




exports.getshopdetailstitle = function (data, callback) {
    var cntxtDtls = "in getshopdetailstitle";
    var QRY_TO_EXEC = `SELECT * from shop_list_t where  id = ? and d_in='0'`
    var values = [data.shop_id];
    if (callback && typeof callback === "function") {
        dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
            callback(err, results);
        });
    }
    else {
        return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
    }
};



// exports.getshopdetailstitle = function (data, callback) {
//     var cntxtDtls = "in getshopdetailstitle";
//     var QRY_TO_EXEC = `select * from ${data.table_name} where shop_id=?`
//     var values = [data.shop_id];
//     if (callback && typeof callback === "function") {
//         dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
//             callback(err, results);
//         });
//     }
//     else {
//         return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
//     }
// };


exports.getversion = function (callback) {
	var cntxtDtls = "in getversion";
	var QRY_TO_EXEC = ` select * from apps_version_t;`
	let params = [];
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	} else {
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
	}
};




exports.getsupport = function (data , callback) {
	var cntxtDtls = "in getsupport";
	var QRY_TO_EXEC = `select * from franchise_t where location_id in (${data.location_id}); `;
	let params = [];
	console.log(QRY_TO_EXEC)
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	} else {
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
	}
};




exports.updateSubCategoryStatus = function (data, callback) {
    var cntxtDtls = "in updateSubCategoryStatus";
    console.log("👉 API HIT: updateSubCategoryStatus");
    console.log("📥 Incoming Data:", data);

    // ✅ Validation
    if (!data.shop_id || !data.sub_category_id) {
        console.log("❌ Missing Parameters:", data);
        return callback(new Error("Missing required parameters: shop_id or sub_category_id"), null);
    }

    var GET_TABLE_NAME_QRY = `SELECT shop_items_tb_nm FROM shop_list_t WHERE id = ?`;
    console.log("🟡 Fetching table name with shop_id:", data.shop_id);

    dbutil.sqlinjection(
        sqldb.MySQLConPool,
        GET_TABLE_NAME_QRY,
        [data.shop_id],
        cntxtDtls,
        function (err, results) {
            if (err) {
                console.log("❌ Error fetching table name:", err);
                return callback(err, null);
            }

            console.log("✅ Table query result:", results);

            if (!results || results.length === 0 || !results[0].shop_items_tb_nm) {
                console.log("❌ No table found for shop_id:", data.shop_id);
                return callback(new Error("No valid table found for the given shop_id"), null);
            }

            var tableName = results[0].shop_items_tb_nm.trim();
            console.log("📌 Table Name:", tableName);

            // ✅ SQL Injection Protection
            if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
                console.log("❌ Invalid table name detected:", tableName);
                return callback(new Error("Invalid table name detected"), null);
            }

            // ✅ Final Update Query with conditional logic
            // Skip update: sub_active_status == 0 AND active_status == 1
            // Only update rows that do NOT match (sub_active_status=0 AND active_status=1)
            const UPDATE_QRY = `
                UPDATE ${tableName}
                SET 
                    sub_active_status = ?,
                    active_status = ?
                WHERE 
                    shop_id = ? 
                    AND sub_category_id = ?
                    AND NOT (active_status = 1 AND sub_active_status = 0)
            `;

            const values = [
                data.sub_active_status,
                data.sub_active_status,
                data.shop_id,
                data.sub_category_id
            ];

            console.log("🟢 Running UPDATE Query:");
            console.log("Query:", UPDATE_QRY);
            console.log("Values:", values);

            dbutil.sqlinjection(
                sqldb.MySQLConPool,
                UPDATE_QRY,
                values,
                cntxtDtls,
                function (err, updateResults) {
                    if (err) {
                        console.log("❌ Update Error:", err);
                        return callback(err, null);
                    }

                    // ✅ Check if any rows were actually updated
                    if (updateResults.affectedRows === 0) {
                        console.log("⚠️ No rows updated - possibly skipped due to active_status=1 & sub_active_status=0 condition");
                        return callback(null, {
                            message: "No rows updated. Row may be protected (active_status=1, sub_active_status=0).",
                            affectedRows: 0
                        });
                    }

                    console.log("✅ Update Success:");
                    console.log("📊 Result:", updateResults);
                    callback(null, updateResults);
                }
            );
        }
    );
};









