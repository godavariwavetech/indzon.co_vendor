var sqldb = require('../../config/dbconnect');

var dbutil = require(appRoot + '/utils/dbutils');
var moment = require('moment');
var http = require("https");
var fs = require('fs');
var express = require('express');
router = express.Router();
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");

const logoPath = path.join(__dirname, "../assets/Logo.png");
const logoPath1 = path.join(__dirname, "../assets/signature.png");
const logoPath2 = path.join(__dirname, "../assets/checkmark.png");

// **************************************************** Login Start **************************************************************************

exports.checkUserExistMdl = function (number, pwd, callback) {
	var cntxtDtls = "in checkUserExistMdl";
	var QRY_TO_EXEC = ` SELECT * from users where number = ? and  pwd = ? and admin_type in (1,2) and d_in <> 1;`;
	let params = [number, pwd]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getUserDataMdl = function (user_id, callback) {
	var cntxtDtls = "in getUserDataMdl";
	var QRY_TO_EXEC = `SELECT mm.* from main_module as mm join admin_permission as ps on mm.id=ps.module_id  where ps.user_id =? and ps.d_in <> 1 and mm.d_in=0 group by ps.module_id ORDER BY mm.main_module_order;
	SELECT mm.* from sub_module as mm join admin_permission as ps on mm.id=ps.sub_module_id  where ps.user_id =? and ps.d_in <> 1 and mm.d_in=0 order by module_order;`;
	let params = [user_id, user_id]
	if (callback && typeof callback == "function")
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getupdatemodulesmdl = function (data, callback) {
	var cntxtDtls = "in getupdatemodulesmdl";
	var QRY_TO_EXEC = `SELECT CASE WHEN p.user_id IS NOT NULL THEN 'true' ELSE 'false' END AS check_sub_menu, p.user_id, sm.id, sm.module_id, m.title AS module_nm, sm.path AS link, sm.icon, sm.title AS label, sm.id, m.icon, p.d_in, CASE WHEN p.user_id IS NULL THEN 0 ELSE 1 END AS check_sub_menu, sm.module_order FROM sub_module AS sm JOIN main_module AS m ON sm.module_id = m.id LEFT JOIN (SELECT * FROM admin_permission WHERE user_id = ?) AS p ON p.sub_module_id = sm.id WHERE sm.d_in = 0 AND m.d_in = 0
    UNION
    SELECT CASE WHEN p.user_id IS NOT NULL THEN 'true' ELSE 'false' END AS check_sub_menu, p.user_id, NULL AS id, m.id AS module_id, m.title AS module_nm, m.path AS link, m.icon, m. title AS label, m.id, m.icon, NULL AS d_in, CASE WHEN p.user_id IS NULL THEN 0 ELSE 1 END AS check_sub_menu, m.main_module_order FROM main_module AS m LEFT JOIN (SELECT * FROM admin_permission WHERE user_id = ? ) AS p ON p.module_id = m.id WHERE m.title = 'Dashboard' AND m.d_in = 0 ORDER BY module_id;`;
	let values = [data.usr_id, data.usr_id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
};

exports.checkNumbermdl = function (data, callback) {
	var cntxtDtls = "in checkNumbermdl";
	var QRY_TO_EXEC = `select * from users where number= ? ;`;
	let params = [data.number]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.submitusersloginmdl = function (data, callback) {
	var cntxtDtls = "in submitusersloginmdl";
	var QRY_TO_EXEC = `INSERT INTO users(name, number,email,pwd) VALUES (?,?,?,?)`;
	let params = [data.name, data.number, data.email, data.pwd]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.submitpermissions = function (lastid, data, callback) {
	var cntxtDtls = "in submitpermissions";
	var host = data.selectedmoduleslist;
	var QRY_TO_EXEC = '';
	var MU_QRY_TO_EXEC = '';
	let params = [];
	for (let i = 0; i < host.length; i++) {
		QRY_TO_EXEC = `insert into admin_permission(user_id, module_id, sub_module_id) values(?,?,?);`;
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(lastid, host[i].module_id, host[i].id);
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getuserlistmdl = function (callback) {
	var cntxtDtls = "in getuserlistmdl";
	var QRY_TO_EXEC = `SELECT l.id, name, l.number,l.email,l.pwd, GROUP_CONCAT(DISTINCT m.title) AS module_nm, COUNT(m.title) AS mcnt, GROUP_CONCAT(sm.title) AS sub_menu FROM admin_permission AS p JOIN sub_module AS sm ON p.sub_module_id = sm.id JOIN main_module AS m ON p.module_id = m.id JOIN users AS l ON l.id = p.user_id WHERE p.d_in = 0 AND l.d_in = 0 AND m.d_in = 0 AND l.admin_type Not In (2,3) GROUP BY p.user_id ORDER BY l.id DESC;`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.postusermenulistMdl = function (modulesData, module_id, usr_id, employeeDetails, callback) {
	var cntxtDtls = "in postusermenulistMdl";
	var QRY_TO_EXEC2 = `DELETE FROM admin_permission WHERE user_id = ?;`;
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC2, [usr_id], cntxtDtls, function (err, results1) {
			if (err) return callback(err, results1);
			var MU_QRY_TO_EXEC = '';
			var params = [];
			for (let i = 0; i < modulesData.length; i++) {
				MU_QRY_TO_EXEC += `INSERT INTO admin_permission(company_id, user_id, module_id, sub_module_id)
                                   VALUES(?, ?, ?, ?);`;
				params.push(0, modulesData[i][0], modulesData[i][1], modulesData[i][2])

			}
			var EMPLOYEE_QRY_TO_EXEC = `Update users set name = ?,number = ?,email = ?,pwd = ? where id = ?;`;
			var params1 = [employeeDetails[0], employeeDetails[1], employeeDetails[2], employeeDetails[3], usr_id]

			dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC + EMPLOYEE_QRY_TO_EXEC, [...params, ...params1], cntxtDtls, function (err, results) {
				callback(err, results);
				return;
			});
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC2, [usr_id], cntxtDtls);
};

exports.deleteusermdl = function (data, callback) {
	var cntxtDtls = "in deleteusermdl";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		var QRY_TO_EXEC = `Update users set d_in=1 where id= ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

// ************* Login End **************//


// ************** App Users Start ************//

exports.getusersprofilemdl = function (data, callback) {
	var cntxtDtls = "in getusersprofilemdl";
	var QRY_TO_EXEC = `select * from users where id IN (?) and d_in=0`;
	var values = [data.user_id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.updateuserpassword = function (data, callback) {
	var cntxtDtls = "in updateuserpassword";
	var QRY_TO_EXEC = `update users set pwd = ? where id IN (?)`;
	var values = [data.pwd, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.updatepwdinfranchisetable = function (data, callback) {
	var cntxtDtls = "in updatepwdinfranchisetable";
	var QRY_TO_EXEC = `update franchise_t set franchise_password = ? where id IN (?)`;
	var values = [data.pwd, data.shop_id]

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.updateimagemdl = function (data, imageupload, callback) {
	var cntxtDtls = "in updateimagemdl";
	var QRY_TO_EXEC = `update users set image = ? where id IN (?) ;`;
	var params = [imageupload, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

// *************** App Users End ***************//

// *************Main module Start *************//

exports.shop_registration = function (data, imageUploadbank, imageUploadshoplic, imageUploadk1, imageUploadk2, imageUploadk3, imageUploadshop, imageUploadfssai, imageUploadgst, imageUploadpancard, imageUploaddrug, callback) {
	var cntxtDtls = "in shop_registration";
	var createddate = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");

	const currentYear = new Date().getFullYear();

	// Query to get the last inserted purchase order number for the current year
	var QRY_GET_LAST_ORDER = ` SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(shop_vendor_code, '-', -1) AS UNSIGNED)), 0) AS last_order FROM shop_list_t WHERE shop_vendor_code LIKE ?;`;

	let orderPrefix = `A-${currentYear}-%`;

	dbutil.sqlinjection(sqldb.MySQLConPool, QRY_GET_LAST_ORDER, [orderPrefix], cntxtDtls, function (err, result) {
		if (err) {
			callback(err, null);
			return;
		}

		let lastOrderNumber = parseInt(result[0].last_order) || 0;
		let nextOrderNumber = lastOrderNumber + 1;

		// Format the new order number as "PO-YYYY-XXX" (e.g., PO-2025-001)
		let vendorcode = `A-${currentYear}-${String(nextOrderNumber).padStart(1, '0')}`;

		let randomOTP = Math.floor(100000 + Math.random() * 900000);
		var QRY_TO_EXEC = `INSERT INTO shop_list_t (shop_name,shop_phone_number,shop_email,shop_address,short_address,shop_latitude,shop_longitude,shop_fssai_lic,shop_lic,shop_drug_lic,shop_pancard,admin_percentage,shop_gst_number,registration_fee,total_registration_fee,shop_bank_details,shop_license_image,shop_interiors_image1,shop_interiors_image2,shop_interiors_image3,shop_image,shop_pancard_image,shop_fssai_image,shop_gst_image,shop_drug_image,category_id,location_id,shop_unique_id,acceptTerms,i_ts,shop_open_time,shop_open_time2,shop_close_time,shop_close_time2,shop_password,shop_items_tb_nm,vendor_payment_otp,shop_vendor_code) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;

		let values = [data.shop_name, data.shop_phone_number, data.shop_email, data.shop_address, data.short_address, data.shop_latitude, data.shop_longitude, data.shop_fssai_lic, data.shop_lic, data.shop_drug_lic, data.shop_pancard, data.admin_percentage, data.shop_gst_number || "Not Applicable", data.registration_fee, data.total_registration_fee, imageUploadbank, imageUploadshoplic, imageUploadk1, imageUploadk2, imageUploadk3, imageUploadshop, imageUploadpancard, imageUploadfssai, imageUploadgst, imageUploaddrug, data.category_id, data.location_id, data.shop_unique_id || "0", data.acceptTerms, createddate, data.shop_open_time, data.shop_open_time, data.shop_close_time, data.shop_close_time, "123456", data.table_name, randomOTP, vendorcode]
		console.log(QRY_TO_EXEC, values)
		if (callback && typeof callback == "function") {
			dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
				callback(err, results);
				return;
			});
		}
		else
			return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
	});

};

exports.insertshopsubcategory = function (insertId, data, callback) {
	var cntxtDtls = "in insertshopsubcategory";
	var host = data.sub_category;
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (let i = 0; i < host.length; i++) {
		QRY_TO_EXEC = `insert into shop_subcategory_list_t (shop_id,location_id,category_id, sub_category_id, sub_category_name,sub_category_image,subcategory_tag_line) values(?,?,?,?,?,?,?);`;
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(insertId, data.location_id, data.category_id, host[i].id, host[i].name, host[i].image, host[i].tagline);
	}
	console.log(QRY_TO_EXEC, params)
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.insertshopfilter = function (insertId, data, callback) {
	var cntxtDtls = "in insertshopfilter";
	var host = data.filter_id;
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (let i = 0; i < host.length; i++) {
		QRY_TO_EXEC = `insert into shop_filter_list_t (shop_id,location_id,category_id, filter_id, filter_name) values(?,?,?,?,?);`;
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(insertId, data.location_id, data.category_id, host[i].id, host[i].name);
	}
	console.log(QRY_TO_EXEC, params)
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updateshopimageintable = function (imagekitUrl, insertId, callback) {
	var cntxtDtls = "in updateshopimageintable";
	var QRY_TO_EXEC = `UPDATE shop_list_t SET shop_image = ? WHERE id = ?`;
	let value = [imagekitUrl, insertId]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.addshopdatainuserstbl = function (insertId, data, callback) {
	var cntxtDtls = "in addshopdatainuserstbl";
	var QRY_TO_EXEC = `INSERT INTO users (admin_type ,name ,number ,email,address,shop_id,shop_category_id,pwd) VALUES (?,?,?,?,?,?,?,?);`;
	let value = ['3', data.shop_name, data.shop_phone_number, data.shop_email, data.shop_address, insertId, data.category_id, '123456']
	console.log(QRY_TO_EXEC, value)

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.addshoppermissions = function (insertId, data, callback) {
	var cntxtDtls = "in addshoppermissions";
	var host = [
		{ module_id: 4, sub_module_id: 22 },
		{ module_id: 4, sub_module_id: 6 },
		{ module_id: 6, sub_module_id: 26 },
		{ module_id: 11, sub_module_id: 28 },
		{ module_id: 11, sub_module_id: 29 },
	];
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (let i = 0; i < host.length; i++) {
		QRY_TO_EXEC = `insert into admin_permission (user_id,module_id,sub_module_id) values(?,?,?);`;
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(insertId, host[i].module_id, host[i].sub_module_id);
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updateshopid = function (lastid, callback) {
	var cntxtDtls = "in updateshopid";
	var QRY_TO_EXEC = `UPDATE shop_list_t set shop_unique_id  = ? where id = ?;`;
	var value = [lastid, lastid]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.sendregistrationsuccessemail = function (data, callback) {
	if (!data.shop_email || !data.shop_name) {
		return callback(new Error("Missing required fields"), null);
	}

	sendSuccessEmail(data.shop_email, data.shop_name, callback);
};


function sendSuccessEmail(email, shopName, callback) {
	let transporter = nodemailer.createTransport({
		host: "localhost",  // Use localhost as per GoDaddy's instructions
		port: 25,           // Use port 25 (not 465 or 587)
		secure: false,      // Must be false for port 25
		// auth: {
		//     user: "Support@freshozapcart.com",
		//     pass: "Babloo@!9515" // Ensure this is correct
		// },
		tls: {
			rejectUnauthorized: false // Allow self-signed certificates
		}
	});

	let mailOptions = {
		from: '"Freshozapcart Support" <support@freshozapcart.com>',
		to: email,
		subject: "Merchant Registration Successful!",
		html: `
        <meta charset=UTF-8><meta content="width=device-width,initial-scale=1"name=viewport>
        <style>
            body {font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;}
            .container {width: 100%; max-width: 600px; margin: 20px auto; background-color: #fff; padding: 20px;
                        border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1); text-align: center;}
            .header {background-color: #007bff; color: #fff; text-align: center; padding: 15px;
                     border-radius: 8px 8px 0 0; font-size: 22px; font-weight: 700;}
            .content {padding: 20px; font-size: 16px; color: #333; text-align: left;}
            .highlight {font-weight: 700;}
            .footer {text-align: center; font-size: 14px; color: #777; margin-top: 20px;}
        </style>

        <div class="container">
            <div class="content">
                <h3>Congratulations, <span class="highlight">${shopName}</span>!</h3>
                <p>Your merchant has been <span class="highlight">successfully registered</span> on our platform.</p>
                <p>Our verification team is reviewing your registration details, and the process will be 
                  <span class="highlight">completed within the next 48 hours</span>. 
                  Once verified, you will receive a confirmation email with further instructions.</p>
                <p><span class="highlight">Thank you for choosing Freshozapcart!</span> 
                  We are excited to support your business and help you grow.</p>
                <p>If you have any questions, feel free to contact our support team.</p>
                <p>Best Regards,<br><strong>Freshozapcart Team</strong></p>
            </div>
        </div>`
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error("Error sending email:", error);
			return callback(error, null);
		} else {
			console.log("Email sent: " + info.response);
			return callback(null, { message: "Email sent successfully" });
		}

	});
}

exports.getshopreg = function (data, callback) {
	var cntxtDtls = "in getshopreg";
	var QRY_TO_EXEC = `SELECT a.*, CONCAT_WS(',', a.shop_interiors_image1, a.shop_interiors_image2, a.shop_interiors_image3) AS images, DATE_FORMAT(a.i_ts, '%d-%m-%Y') AS date, l.location_name, c.category_name,GROUP_CONCAT(DISTINCT s.sub_category_id ORDER BY s.sub_category_id SEPARATOR ',') AS subcategory_ids, GROUP_CONCAT(DISTINCT s.sub_category_name ORDER BY s.sub_category_name SEPARATOR ', ') AS subcategories,GROUP_CONCAT(DISTINCT f.filter_id ORDER BY f.filter_id SEPARATOR ',') AS filter_ids, GROUP_CONCAT(DISTINCT f.filter_name ORDER BY f.filter_name SEPARATOR ', ') AS filters,CONCAT( DATE_FORMAT(STR_TO_DATE(a.shop_open_time, '%H:%i:%s'), '%I:%i %p'), ' - ', DATE_FORMAT(STR_TO_DATE(a.shop_close_time, '%H:%i:%s'), '%I:%i %p')) AS shop_timings FROM shop_list_t AS a LEFT JOIN location_tbl AS l ON l.id = a.location_id LEFT JOIN category_tbl AS c ON c.id = a.category_id LEFT JOIN shop_subcategory_list_t AS s ON s.shop_id = a.id LEFT JOIN shop_filter_list_t AS f ON f.shop_id = a.id WHERE a.d_in = 0 `;

	var params = [];

	if (data.filters.location) {
		QRY_TO_EXEC += ` AND a.location_id = ?`;
		params.push(data.filters.location);
	}

	if (data.filters.category) {
		QRY_TO_EXEC += ` AND a.category_id = ?`;
		params.push(data.filters.category);
	}

	if (data.filters.shop) {
		QRY_TO_EXEC += ` AND a.id IN (?)`;
		params.push(data.filters.shop);
	}

// 	if (params.length === 0) {
// 		return callback(null, []);
// 	}

	QRY_TO_EXEC += ` GROUP BY a.id ORDER BY a.id DESC`;


	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getgroupbyshop = function (callback) {
	var cntxtDtls = "in getgroupbyshop";
	// 	var QRY_TO_EXEC = `SELECT a.* FROM shop_list_t as a WHERE a.d_in=0 GROUP BY shop_unique_id ORDER BY a.id ASC;`;
	var QRY_TO_EXEC = `SELECT a.* FROM shop_list_t as a WHERE a.d_in=0 ORDER BY a.id ASC;`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.gettotalshopstoexport = function (callback) {
	var cntxtDtls = "in gettotalshopstoexport";
	var QRY_TO_EXEC = `SELECT a.shop_name,a.shop_phone_number,a.shop_email,a.shop_vendor_code,a.shop_address,a.short_address,a.shop_latitude,a.shop_latitude,a.shop_longitude,a.shop_fssai_lic,a.shop_lic,a.shop_drug_lic,a.shop_pancard,a.admin_percentage,a.registration_fee,a.total_registration_fee,a.shop_gst_number,a.shop_open_time,a.shop_close_time,b.category_name,c.location_name,a.vendor_verification_status FROM shop_list_t as a JOIN category_tbl as b ON a.category_id = b.id JOIN location_tbl as c ON a.location_id = c.id WHERE a.d_in=0 ORDER BY a.id ASC;`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.updateshopreg = function (data, imageUploadbank, imageUploadshoplic, imageUploadshop, imageUploadk1, imageUploadk2, imageUploadk3, imageUploadfssai, imageUploadgst, imageUploadpancard, imageUploaddrug, callback) {
	var cntxtDtls = "in updateshopreg";
	var QRY_TO_EXEC = `update shop_list_t set shop_name = ?,shop_phone_number = ?,shop_email = ?,location_id = ?,category_id = ?,shop_address = ?,short_address = ?,shop_latitude = ?,shop_longitude = ?,shop_fssai_lic = ?,shop_lic = ?,shop_pancard = ?,admin_percentage = ?,shop_gst_number = ?,shop_bank_details = ?,shop_license_image = ?,shop_image = ?,shop_interiors_image1 = ?,shop_interiors_image2 = ?,shop_interiors_image3 = ?,shop_pancard_image = ?,shop_fssai_image = ?,shop_gst_image = ?,shop_drug_image = ?,shop_open_time = ?,shop_open_time2 = ?,shop_close_time = ?,shop_close_time2 = ?,shop_items_tb_nm = ?,recommended_for_you = ? where id = ?;`;

	let values = [data.shop_name, data.shop_phone_number, data.shop_email, data.location_id, data.category_id, data.shop_address, data.short_address, data.shop_latitude, data.shop_longitude, data.shop_fssai_lic, data.shop_lic, data.shop_pancard, data.admin_percentage, data.shop_gst_number || "Not Applicable", imageUploadbank, imageUploadshoplic, imageUploadshop, imageUploadk1, imageUploadk2, imageUploadk3, imageUploadpancard, imageUploadfssai, imageUploadgst, imageUploaddrug, data.shop_open_time, data.shop_open_time, data.shop_close_time, data.shop_close_time, data.table_name, data.recommended_for_you, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
};

exports.updateshopsubcategory = function (data, callback) {
	var cntxtDtls = "in updateshopsubcategory";
	var host = data.sub_category;
	var DELETE_QRY = `DELETE FROM shop_subcategory_list_t WHERE shop_id = ?;`;
	var INSERT_QRY = '';
	var params = [data.id];

	for (let i = 0; i < host.length; i++) {
		INSERT_QRY += `INSERT INTO shop_subcategory_list_t (shop_id,location_id,category_id, sub_category_id, sub_category_name, sub_category_image,subcategory_tag_line,veg_mode) VALUES (?, ?, ?, ?, ? , ?, ?, ?);`;
		params.push(data.id, data.location_id, data.category_id, host[i].id, host[i].name, host[i].image, host[i].tagline, host[i].veg_mode);
	}

	var FINAL_QRY = DELETE_QRY + INSERT_QRY; // Combine delete and insert queries

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, FINAL_QRY, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	} else {
		return dbutil.sqlinjection(sqldb.MySQLConPool, FINAL_QRY, params, cntxtDtls);
	}
};

exports.updateshopfilter = function (data, callback) {
	var cntxtDtls = "in updateshopfilter";
	var host = data.filter_id;
	var DELETE_QRY = `DELETE FROM shop_filter_list_t WHERE shop_id = ?;`;
	var INSERT_QRY = '';
	var params = [data.id];

	for (let i = 0; i < host.length; i++) {
		INSERT_QRY += `INSERT INTO shop_filter_list_t (shop_id,location_id,category_id,filter_id, filter_name) VALUES (?, ?, ?, ?, ?);`;
		params.push(data.id, data.location_id, data.category_id, host[i].id, host[i].name);
	}

	var FINAL_QRY = DELETE_QRY + INSERT_QRY; // Combine delete and insert queries

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, FINAL_QRY, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	} else {
		return dbutil.sqlinjection(sqldb.MySQLConPool, FINAL_QRY, params, cntxtDtls);
	}
};

exports.updateshopintosearchkey = function (data, imageUploadshop, callback) {
	var cntxtDtls = "in updateshopintosearchkey";
	var QRY_TO_EXEC = `UPDATE search_type_t SET search_text = ?, search_image = ?,search_table = ? WHERE search_id = ? AND search_key_type = ?;`;
	let params = [data.shop_name, imageUploadshop, data.table_name, data.id, '3'];

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
		});
	} else {
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
	}
};

exports.updateshopintousers = function (data, callback) {
	var cntxtDtls = "in updateshopintousers";
	var QRY_TO_EXEC = `UPDATE users SET name = ?, number = ?,email = ?,address = ? WHERE shop_id = ? and admin_type = 3;`;
	let params = [data.shop_name, data.shop_phone_number, data.shop_email, data.shop_address, data.id];

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
		});
	} else {
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
	}
};

exports.deleteshopreg = function (data, callback) {
	var cntxtDtls = "in deleteshopreg";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		var QRY_TO_EXEC = `Update shop_list_t set d_in=1 where id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updateshopactivestatus = function (data, callback) {
	var cntxtDtls = "in updateshopactivestatus";
	var QRY_TO_EXEC = `update shop_list_t set shop_active_status = ? where id = ?;`;
	var params = [data.shop_active_status, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatespecialoffer = function (data, callback) {
	var cntxtDtls = "in updatespecialoffer";
	var QRY_TO_EXEC = `update shop_list_t set special_offer_status = ?,special_offer_name = ? where id = ?;`;
	var params = [data.special_offer_status, data.special_offer_name, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updateshoprating = function (data, callback) {
	var cntxtDtls = "in updateshoprating";
	var QRY_TO_EXEC = `update shop_list_t set shop_rating = ? where id = ?;`;
	var params = [data.shop_rating, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.sendvendorverificationotp = function (data, loginotp, callback) {
	var cntxtDtls = "in sendvendorverificationotp";
	var QRY_TO_EXEC = `UPDATE shop_list_t set vendor_verification_otp  = ? where id = ?;`;
	var value = [loginotp, data.shop_id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.verifyvendorverificationotp = function (data, callback) {
	var cntxtDtls = "in verifyvendorverificationotp";
	var QRY_TO_EXEC = `SELECT * FROM shop_list_t WHERE shop_phone_number = ? AND vendor_verification_otp = ? LIMIT 1;;`;
	var value = [data.shop_phone_number, data.otp]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.updatevendorverificationstatus = function (data, callback) {
	var cntxtDtls = "in updatevendorverificationstatus";
	var QRY_TO_EXEC = `update shop_list_t set shop_active_status = ?, vendor_verification_status = ? where id = ?;`;
	var params = [data.shop_active_status, data.vendor_verification_status, data.id]

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.sendverificationsuccessmailwithpdf = function (data, callback) {
	if (!data) {
		return callback(new Error("Missing required fields"), null);
	}
	data.createddate = moment().utcOffset("+05:30").format("DD-MM-YYYY");
	generateshopdetailsPDF(data, (pdfPath) => {
		sendverificationsuccessinEmail(data, pdfPath, callback);
	});
};

function generateshopdetailsPDF(data, callback) {

	console.log("Generating PDF...");
	const pdfPath = `registration_confirmation_${data.details.shop_name.replace(/\s/g, "_")}.pdf`;

	const doc = new PDFDocument({ size: "A4", margin: 50 });

	const writeStream = fs.createWriteStream(pdfPath);
	doc.pipe(writeStream);

	doc.font('Helvetica-Bold').fontSize(18).text("Merchant Registration Confirmation", { align: "center" });

	doc.moveDown(1);

	const startY = doc.y;

	doc.image(logoPath, 400, startY, { width: 100 });

	doc.font('Helvetica-Bold').fontSize(10)
		.text("NAKSHATRA RPL E-COMMERCE PRIVATE LIMITED", 50, startY, { lineGap: 2 });

	doc.font('Helvetica').fontSize(10)
		.text("GST No: 37AAKCN2826Q1C2", { lineGap: 2 })
		.text("D.No:1-3/5-25/2 Parthasarathi Street, Vidyadharapuram", { lineGap: 2 })
		.text("Vijayawada - 520012, Near RK Public School Road", { lineGap: 2 })
		.text("support@freshozapcart.com", { lineGap: 2 })
		.text("+91 9515787818", { lineGap: 2 });

	doc.moveDown(1);

	doc.font('Helvetica').fontSize(12)
		.text("FreshozapCart has proudly collaborated with ", { continued: true, lineGap: 4 })
		.font("Helvetica-Bold").text(data.details.shop_name || "", { continued: true })
		.font("Helvetica").text(", a trusted merchant who officially registered with us on ", { continued: true })
		.font("Helvetica-Bold").text(data.details.date || "", { continued: true })
		.font("Helvetica").text(". The shop is located at ", { continued: true })
		.font("Helvetica-Bold").text(data.details.shop_address || "", { continued: true })
		.font("Helvetica").text(", under the ", { continued: true })
		.font("Helvetica-Bold").text(data.details.location_id || "", { continued: true })
		.font("Helvetica").text(" region and falls under the ", { continued: true })
		.font("Helvetica-Bold").text(data.details.category_id || "", { continued: true })
		.font("Helvetica").text(" category. For communication purposes, they can be contacted via phone at ", { continued: true })
		.font("Helvetica-Bold").text(data.details.shop_phone_number || "", { continued: true })
		.font("Helvetica").text(" or by email at ", { continued: true })
		.font("Helvetica-Bold").text(data.details.shop_email || "")
		.moveDown(1);

	doc.font("Helvetica").text("This merchant has provided the necessary certifications and documents for verification, including a valid PAN card (", { continued: true, lineGap: 4 })
		.font("Helvetica-Bold").text(data.details.shop_pancard || "", { continued: true })
		.font("Helvetica").text("), Shop License (", { continued: true })
		.font("Helvetica-Bold").text(data.details.shop_lic || "", { continued: true })
		.font("Helvetica").text("), and GSTIN (", { continued: true })
		.font("Helvetica-Bold").text(data.details.shop_gst_number || "", { continued: true })
		.font("Helvetica").text("). Additionally, they have submitted a Registration Fee of ₹", { continued: true })
		.font("Helvetica-Bold").text(data.details.registration_fee.toString() || "", { continued: true })
		.font("Helvetica").text(", making the Total Fee (including GST) ₹", { continued: true })
		.font("Helvetica-Bold").text(data.details.total_registration_fee.toString() || "")
		.moveDown(1);

	// Add FSSAI & Drug Lic if available
	if (data.details.shop_license || data.details.shop_fssai_lic || data.details.shop_drug_lic) {
		doc.font("Helvetica")
			.text("To ensure legal compliance in the food and health sector, the merchant has also shared a valid ", { continued: true, lineGap: 5 });

		let hasPrevious = false;

		if (data.details.shop_license) {
			doc.font("Helvetica-Bold").text(`Shop License (${data.details.shop_license})`, { continued: true });
			hasPrevious = true;
		}

		if (data.details.shop_fssai_lic) {
			if (hasPrevious) {
				doc.font("Helvetica").text(" and a ", { continued: true });
			}
			doc.font("Helvetica-Bold").text(`FSSAI License (${data.details.shop_fssai_lic})`, { continued: true });
			hasPrevious = true;
		}

		if (data.details.shop_drug_lic) {
			if (hasPrevious) {
				doc.font("Helvetica").text(" and a ", { continued: true });
			}
			doc.font("Helvetica-Bold").text(`Drug License (${data.details.shop_drug_lic})`);
		} else {
			doc.font("Helvetica").text(".");
		}

		doc.moveDown(1);
	}

	doc.font("Helvetica").text("The shop operates with standard service timings: ", { continued: true })
		.font("Helvetica-Bold").text(data.details.shop_timings || "")
		.moveDown(1);

	doc.font("Helvetica").text("As part of the partnership, FreshozapCart has applied an Admin Service Fee of ", { continued: true, lineGap: 4 })
		.font("Helvetica-Bold").text(`${data.details.admin_percentage || ""}%`)
		.font("Helvetica").text(" on transactions from this shop.")
		.moveDown(1);

	doc.font("Helvetica").text("The shop is geo-tagged at the coordinates — Latitude: ", { continued: true, lineGap: 4 })
		.font("Helvetica-Bold").text(data.details.shop_latitude || "", { continued: true })
		.font("Helvetica").text(" and Longitude: ", { continued: true })
		.font("Helvetica-Bold").text(data.details.shop_longitude || "", { continued: true })
		.font("Helvetica").text(" — ensuring accurate delivery services. A preview of the shop is also available through their uploaded image.");

	doc.moveDown(1);

	doc.font("Helvetica").text("By completing the registration process, the merchant has acknowledged and accepted the Terms and Conditions,", { lineGap: 4 })
		.moveDown(1);

	const pageWidth = doc.page.width;
	const textWidth = 400;

	doc.font("Helvetica-Bold").fontSize(11)
		.text("Thank you for collaborating with Freshozapcart.", (pageWidth - textWidth) / 2, doc.y, { width: textWidth, align: "center" })
		.text("We appreciate your trust and look forward to a successful partnership!", (pageWidth - textWidth) / 2, doc.y, { width: textWidth, align: "center" });

	doc.moveDown(1);

	// 	doc.font("Helvetica-Bold").fontSize(11)
	// 		.text("Thanks and Regards", { align: "right" })
	// 		.text("CEO", { align: "right" })

	//  doc.image(logoPath1, doc.page.width - 150, doc.y, { width: 100 ,height: 30});

	const signatureY = doc.y + 10;

	const boxX = 45;
	const boxY = signatureY - 5;
	const boxWidth = 200;
	const boxHeight = 70;

	doc.image(logoPath2, boxX, boxY, {
		width: boxWidth, height: boxHeight, opacity: 0.4
	});

	doc
		.rect(boxX, boxY, boxWidth, boxHeight)
		.stroke();

	doc.font("Helvetica-Bold").fontSize(11)
		.text("Digitally verified and signed by", 65, signatureY, { align: "left" })
		.text("Merchant, Valid unless tampered", 50, signatureY + 15, { align: "left" })
		.text("No physical signature required", 50, signatureY + 30, { align: "left" })
		.text("Date: " + data.createddate, 50, signatureY + 45, { align: "left" });

	const rightX = doc.page.width - 250;
	const blockWidth = 200;

	doc.font("Helvetica-Bold").fontSize(11)
		.text("Thanks and Regards", rightX, signatureY, { align: "right", width: blockWidth });

	const imageY = signatureY + 10;
	doc.image(logoPath1, doc.page.width - 150, imageY, { width: 100, height: 30 });

	const ceoY = imageY + 25;
	doc.text("CEO", rightX, ceoY, { align: "right", width: blockWidth });

	doc.moveDown(4);

	doc.fontSize(9).font("Helvetica-Oblique")
		.text("Disclaimer: This is a system-generated document and includes an authorized digital signature.", (pageWidth - textWidth) / 2, doc.y, { width: textWidth, align: "center" })
		.text("For any discrepancies, please contact our support team.", (pageWidth - textWidth) / 2, doc.y, { width: textWidth, align: "center" });

	doc.end();
	writeStream.on("finish", () => {
		callback(pdfPath);
	});
}

function sendverificationsuccessinEmail(data, pdfPath, callback) {

	let transporter = nodemailer.createTransport({
		// 		host: "smtpout.secureserver.net",
		// 		port: 465,
		// 		secure: true,
		// 		auth: {
		// 			user: "Support@freshozapcart.com",
		// 			pass: "Babloo@!9515"
		// 		}

		host: "localhost",
		port: 25,
		secure: false,
		tls: {
			rejectUnauthorized: false
		}
	});

	let mailOptions = {
		from: '"Freshozapcart Support" <support@freshozapcart.com>',
		to: `${data.details.shop_email}`,
		subject: "Registration Successful – Welcome to Freshozapcart",
		html: `
			<div style="font-family: Arial, sans-serif; text-align: left; padding: 20px;">
				<h2>Merchant Verification Successful!</h2>
				<p>Dear ${data.details.shop_name},</p>
				<p>We are pleased to inform you that your verification process has been successfully completed. Your shop is now live on the Freshozapcart app!</p>
				
				<h3>Next Steps:</h3>
				<ul>
					<li>Start managing your store and accepting orders.</li>
					<li>Ensure your product listings are up to date.</li>
					<li>Monitor your sales and track your earnings in real-time.</li>
				</ul>
				
            <h3>Dashboard Access Details:</h3>
            <p>You can manage your shop, update product listings, and track your sales using the merchant dashboard:</p>
            
            <p><strong>Dashboard URL:</strong> <a href="https://control.freshozapcart.com" target="_blank">control.freshozapcart.com</a></p>
            <p><strong>Login Credentials:</strong></p>
            <ul>
                <li><strong>Registered Phone Number:</strong> ${data.details.shop_phone_number}</li>
                <li><strong>Password:</strong> 123456</li>
            </ul>

            <p>For security reasons, we recommend updating your password after logging in.</p>				
				<p>For any queries, feel free to reach out to our support team.</p>
				<p><strong>Best Regards,<br>Freshozapcart Team</strong></p>
			</div>`,
		attachments: [
			{
				filename: `Registration_Confirmation.pdf`,
				path: pdfPath,
				contentType: "application/pdf"
			}
		]
	};

	transporter.sendMail(mailOptions, (error, info) => {
		fs.unlinkSync(pdfPath); // Delete the file after sending
		if (error) {
			return callback(error, null);
		} else {
			return callback(null, { message: "Email sent successfully" });
		}
	});
}


// ************* MainModules End **********//

// ************* masters Start **********//

exports.updateditemactivestatus = function (data, callback) {
	var cntxtDtls = "in updateditemactivestatus";
	var QRY_TO_EXEC = `update ${data.table_name} set active_status = ? where id = ?;`;
	var params = [data.active_status, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.addlocation = function (data, imageupload, callback) {
	var cntxtDtls = "in addlocation";
	var QRY_TO_EXEC = `INSERT INTO location_tbl (location_name,location_image,location_latitude,location_longitude,maximum_delivery_service_km,payment_type,razorpay_key,razorpay_secret_key,del_minimum_km,del_minimum_del_charge,del_per_km_chargers) VALUES (?,?,?,?,?,?,?,?,?,?,?);`;
	let params = [data.location_name, imageupload, data.location_latitude, data.location_longitude, data.maximum_delivery_service_km, data.payment_type, data.razorpay_key, data.razorpay_secret_key, data.del_minimum_km, data.del_minimum_del_charge, data.del_per_km_chargers]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.addlocationsincategorytbl = function (insertId, data, callback) {
	var cntxtDtls = "in addlocationsincategorytbl";

	var GET_DATA = `SELECT a.* FROM category_tbl as a where d_in = 0;`;

	dbutil.sqlinjection(sqldb.MySQLConPool, GET_DATA, [], cntxtDtls, (err, results) => {
		if (err) return callback(err, null);
		if (!results || results.length === 0) return callback(null, { message: "No service types found" });

		var MU_QRY_TO_EXEC = '';
		var params = [];

		for (let i = 0; i < results.length; i++) {
			MU_QRY_TO_EXEC += `INSERT INTO category_location_t (category_id,category_name, category_image, veg_mode, shop_items_tb_nm,location_id) VALUES (?, ?, ?, ?, ?, ?); `;
			params.push(results[i].id, results[i].category_name, results[i].category_image, results[i].veg_mode, results[i].shop_items_tb_nm, insertId);
		}
		if (typeof callback === "function") {
			dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, insertResult) {
				callback(err, insertResult);
			});
		} else {
			return dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls);
		}
	});
};

exports.getlocation = function (callback) {
	var cntxtDtls = "in getlocation";
	var QRY_TO_EXEC = `SELECT *, CASE 
        WHEN payment_type = 0 THEN 'COD'
        WHEN payment_type = 1 THEN 'Pay Online'
        WHEN payment_type = 2 THEN 'COD, Pay Online'
        ELSE 'Unknown'
    END AS payment_type_name FROM location_tbl WHERE d_in = 0 ORDER BY id DESC;`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.updatelocation = function (data, imageupload, callback) {
	var cntxtDtls = "in updatelocation";
	var QRY_TO_EXEC = `update location_tbl set location_name = ?,location_image = ?, location_latitude = ?,location_longitude = ?,maximum_delivery_service_km = ?,payment_type = ?,razorpay_key = ?,razorpay_secret_key = ?, del_minimum_km = ?, del_minimum_del_charge = ?, del_per_km_chargers = ? where id = ?;`;
	var params = [data.location_name, imageupload, data.location_latitude, data.location_longitude, data.maximum_delivery_service_km, data.payment_type, data.razorpay_key, data.razorpay_secret_key, data.del_minimum_km, data.del_minimum_del_charge, data.del_per_km_chargers, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatelocationserviceactivestatus = function (data, callback) {
	var cntxtDtls = "in updatelocationserviceactivestatus";
	var QRY_TO_EXEC = `update location_tbl set service_active_status = ? where id = ?;`;
	var params = [data.service_active_status, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatelocationnameintables = function (data, callback) {
	var cntxtDtls = "in updatelocationnameintables";
	var QRY_TO_EXEC = `update banners_lst_t set location_name = ? where location_id = ?;
	                update coupon_code_t set location_name = ? where location_id = ?;
					update notifications_t set location_name = ? where location_id = ?;
					update slot_timings_t set location_name = ? where location_id = ?;`;
	var params = [data.location_name, data.id, data.location_name, data.id, data.location_name, data.id, data.location_name, data.id, data.location_name, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.deletelocation = function (data, callback) {
	var cntxtDtls = "in deletelocation";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		var QRY_TO_EXEC = `Update location_tbl set d_in=1 where id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.addcategory = function (data, imageupload, callback) {
	var cntxtDtls = "in addcategory";

	function sanitizeTableName(categoryName) {
		return categoryName
			.toLowerCase()
			.replace(/[^a-z0-9]/gi, '_')
			.replace(/_+/g, '_')
			.replace(/^_|_$/g, '');
	}

	var sanitizedCategory = sanitizeTableName(data.category_name);
	var tableName = `z_${sanitizedCategory}_item_lst_t`;

	// NEW: copy the full structure of z_all_items_t
	var createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} LIKE z_all_items_t`;

	var shopname = tableName.toLowerCase();

	var insertCategoryQuery = `INSERT INTO category_tbl (category_name, category_image, shop_items_tb_nm) VALUES (?, ?, ?);`;

	let params = [data.category_name, imageupload, shopname];
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, createTableQuery, [], cntxtDtls, function (err) {
			if (err) {
				callback(err, null);
				return;
			}
			dbutil.sqlinjection(sqldb.MySQLConPool, insertCategoryQuery, params, cntxtDtls, function (err, results) {
				callback(err, results, shopname);
				return;
			});
		});
	} else {
		return dbutil.sqlinjection(sqldb.MySQLConPool, createTableQuery, [], cntxtDtls)
			.then(() => dbutil.sqlinjection(sqldb.MySQLConPool, insertCategoryQuery, params, cntxtDtls));
	}
};

// exports.addcategorylocationtable = function (insertId, shopname, data, imageupload, callback) {
// 	var cntxtDtls = "in addcategorylocationtable";
// 	var host = data.alllocationids;
// 	var MU_QRY_TO_EXEC = '';
// 	var QRY_TO_EXEC = '';
// 	var params = [];
// 	for (let i = 0; i < host.length; i++) {
// 		QRY_TO_EXEC = `INSERT INTO category_location_t (category_id,category_name, category_image, veg_mode, shop_items_tb_nm,location_id) VALUES (?, ?, ?, ?, ?, ?);`;
// 		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
// 		params.push(insertId, data.category_name, imageupload, data.veg_mode, shopname, host[i]);
// 	}
// 	if (callback && typeof callback == "function") {
// 		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
// 			callback(err, results);
// 			return;
// 		});
// 	}
// 	else
// 		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
// };

exports.updatecategoryimageintables = function (imagekitUrl, insertId, callback) {
	var cntxtDtls = "in updatecategoryimageintables";
	var QRY_TO_EXEC = `UPDATE category_tbl SET category_image = ? WHERE id = ?`;
	let value = [imagekitUrl, insertId]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.getcategory = function (admin_type_id, franchise_id, callback) {
	// console.log(admin_type_id, franchise_id)
	var cntxtDtls = "in getcategory";
	var QRY_TO_EXEC = `SELECT * FROM category_tbl WHERE d_in=0 order by id desc;`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

// exports.getcategory = function (admin_type_id, franchise_id, callback) {
// 	console.log('Admin Type:', admin_type_id, 'Franchise ID:', franchise_id);

// 	const cntxtDtls = "in getcategory";
// 	let QRY_TO_EXEC = '';
// 	let params = [];

// 	if (admin_type_id == '1') {
// 		// Admin type 1 → all categories
// 		QRY_TO_EXEC = `SELECT * FROM category_tbl WHERE d_in = 0 ORDER BY id DESC;`;
// 	} else if (admin_type_id == '2') {
// 		// Admin type 2 → filter by franchise_id via location join
// 		QRY_TO_EXEC = `SELECT c.category_id as id,c.category_name,c.category_image,c.location_id,c.shop_items_tb_nm,c.veg_mode 
// 	  FROM category_location_t c 
// 	  JOIN location_tbl l ON c.location_id = l.id 
// 	  WHERE l.franchise_id = ? 
// 	    AND category_active_status = 0 
// 	    AND c.d_in = 0 
// 	  ORDER BY c.id DESC;
// 	`;
// 		params = [franchise_id];
// 	} else {
// 		// fallback → return empty
// 		QRY_TO_EXEC = `SELECT * FROM category_tbl WHERE 1=0;`;
// 	}

// 	// Always pass params to execQuery
// 	if (callback && typeof callback == "function") {
// 		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
// 			callback(err, results);
// 			return;
// 		});
// 	}
// 	else
// 		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
// };

exports.getlocationcategory = function (data, callback) {
	var cntxtDtls = "in getlocationcategory";
	// var QRY_TO_EXEC = `SELECT c.*,l.location_name FROM category_location_t as c LEFT JOIN location_tbl as l ON l.id = c.location_id WHERE c.d_in = 0 `;

	var QRY_TO_EXEC = `SELECT * FROM category_tbl WHERE d_in = 0 ORDER BY id DESC;`;

	var params = [];

	// if (data.filters && data.filters.location !== undefined && data.filters.location !== '') {
	// 	if (data.filters.location != "0") {
	// 		QRY_TO_EXEC += ` AND c.location_id = ?`;
	// 		params.push(data.filters.location);
	// 	}
	// } else {
	// 	return callback(null, []);
	// }

	// if (params.length === 0 && data.filters.location != "0") {
	// 	return callback(null, []);
	// }

	// QRY_TO_EXEC += ` order by c.id desc;`;

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatecategory = function (data, imageupload, callback) {
	var cntxtDtls = "in updatecategory";
	var QRY_TO_EXEC = `update category_tbl set category_name = ?,category_image = ? where id = ?`;
	var params = [data.category_name, imageupload, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatecategoryinsearch = function (data, imageupload, callback) {
	var cntxtDtls = "in updatecategoryinsearch";
	var QRY_TO_EXEC = `UPDATE sub_category_tbl SET category_name = ? WHERE category_id = ?;
						UPDATE main_filter_tbl SET category_name = ? WHERE category_id = ?;
						UPDATE ${data.table_name} SET category_name = ? WHERE category_id = ?;
						UPDATE z_all_items_t SET category_name = ? WHERE category_id = ?;`;
	let params = [data.category_name, data.id, data.category_name, data.id, data.category_name, data.id, data.category_name, data.id];

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
		});
	} else {
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
	}
};


exports.deletecategory = function (data, callback) {
	var cntxtDtls = "in deletecategory";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		var QRY_TO_EXEC = `Update category_tbl set d_in=1 where id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatecategorywithlocation = function (data, callback) {
	var cntxtDtls = "in updatecategorywithlocation";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		var QRY_TO_EXEC = `Update category_location_t set d_in=1 where category_id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};
exports.updatecategoryactivestatus = function (data, callback) {
	var cntxtDtls = "in updatecategoryactivestatus";
	var QRY_TO_EXEC = `update category_location_t set category_active_status = ? where id = ?;`;
	var params = [data.category_active_status, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};


exports.updatehighlight = function (data, callback) {
	var cntxtDtls = "in updatehighlight";
	var QRY_TO_EXEC = `update category_tbl set highlight = ? where id = ?;`;
	var params = [data.highlight, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};
exports.addsubcategory = function (data, imageupload, callback) {
	var cntxtDtls = "in addsubcategory";
	var QRY_TO_EXEC = `INSERT INTO sub_category_tbl (sub_category_name,sub_category_image,subcategory_tag_line,category_id,category_name) VALUES (?,?,?,?,?);`;
	let params = [data.sub_category_name, imageupload, data.subcategory_tag_line, data.category_id, data.category_name]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.addsubcategoryintosearch = function (insertId, data, imageupload, callback) {
	var cntxtDtls = "in addsubcategoryintosearch";
	var QRY_TO_EXEC = `INSERT INTO search_type_t (search_key_type,search_text,search_image,search_id,search_table) VALUES (?,?,?,?,?);`;
	let params = ['2', data.sub_category_name, imageupload, insertId, 'shop_subcategory_list_t']
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatesubcategoryimageintables = function (imagekitUrl, insertId, callback) {
	var cntxtDtls = "in updatesubcategoryimageintables";
	var QRY_TO_EXEC = `UPDATE sub_category_tbl SET sub_category_image = ? WHERE id = ?`;
	let value = [imagekitUrl, insertId]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.getsubcategory = function (callback) {
	var cntxtDtls = "in getsubcategory";
	var QRY_TO_EXEC = `SELECT * FROM sub_category_tbl WHERE d_in=0 order by id desc;`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.updatesubcategory = function (data, imageupload, callback) {
	var cntxtDtls = "in updatesubcategory";
	var QRY_TO_EXEC = `update sub_category_tbl set category_id = ?,category_name = ?,sub_category_name = ?,sub_category_image = ?,subcategory_tag_line = ? where id = ?;`;
	var params = [data.category_id, data.category_name, data.sub_category_name, imageupload, data.subcategory_tag_line, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatesubcategoryinsearch = function (data, imageupload, callback) {
	var cntxtDtls = "in updatesubcategoryinsearch";
	var QRY_TO_EXEC = ` Update ${data.table_name} set sub_category_name = ? where sub_category_id = ?;
					 Update shop_subcategory_list_t set sub_category_name = ?,sub_category_image = ?,subcategory_tag_line = ? where sub_category_id = ?;
					 Update z_all_items_t set sub_category_name = ? where sub_category_id = ?;`;
	let params = [data.sub_category_name, data.id, data.sub_category_name, imageupload, data.subcategory_tag_line, data.id, data.sub_category_name, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.deletesubcategory = function (data, callback) {
	var cntxtDtls = "in deletesubcategory";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		var QRY_TO_EXEC = `Update sub_category_tbl set d_in=1 where id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getmatchedcategory = function (id, callback) {
	var cntxtDtls = "in getmatchedcategory";
	var QRY_TO_EXEC = `SELECT * FROM sub_category_tbl WHERE category_id = ? AND d_in = 0 ORDER BY sub_category_name ASC;`;
	let params = [id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.addmainfilter = function (data, callback) {
	var cntxtDtls = "in addmainfilter";
	var createddate = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
	var QRY_TO_EXEC = `INSERT INTO main_filter_tbl (category_id,category_name,main_filter_name,i_ts) VALUES (?,?,?,?);`;
	let params = [data.category_id, data.category_name, data.main_filter_name, createddate]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getmainfilter = function (callback) {
	var cntxtDtls = "in getmainfilter";
	var QRY_TO_EXEC = `SELECT * FROM main_filter_tbl WHERE d_in=0 order by id desc;`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.updatemainfilter = function (data, callback) {
	var cntxtDtls = "in updatemainfilter";
	var QRY_TO_EXEC = `update main_filter_tbl set category_id = ?,category_name = ?,main_filter_name = ? where id = ?;`;
	var params = [data.category_id, data.category_name, data.main_filter_name, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatefiltersintables = function (data, callback) {
	var cntxtDtls = "in updatefiltersintables";
	var QRY_TO_EXEC = `update shop_filter_list_t set filter_name = ? where filter_id = ?;
	update ${data.table_name} set filter_one = ? where filter_one = ?;
	update z_all_items_t set filter_one = ? where filter_one = ?;`;
	var params = [data.main_filter_name, data.id, data.main_filter_name, data.old_filter, data.main_filter_name, data.old_filter]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.deletemainfilter = function (data, callback) {
	var cntxtDtls = "in deletemainfilter";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		var QRY_TO_EXEC = `Update main_filter_tbl set d_in=1 where id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.addoffer = function (data, imageUploadbanner, imageUploadtagline, callback) {
	var cntxtDtls = "in addoffer";
	const shopIdArray = data.shop_id;
	const shopIdsAsString = shopIdArray.join(',');
	var QRY_TO_EXEC = `INSERT INTO shop_offers_tbl (location_id,
	category_id,banner_image,shop_id,offer_title,offer_tag_line,tagline_image,veg_mode) VALUES (?,?,?,?,?,?,?,?);`;
	let params = [data.location_id, data.category_id, imageUploadbanner, shopIdsAsString, data.offer_title, data.offer_tag_line, imageUploadtagline, data.veg_mode]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updateofferbannerimage = function (imagekitUrl, insertId, callback) {
	var cntxtDtls = "in updateofferbannerimage";
	var QRY_TO_EXEC = `UPDATE shop_offers_tbl SET banner_image = ? WHERE id = ?`;
	let value = [imagekitUrl, insertId]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.updateoffertaglineimage = function (imagekitUrl, insertId, callback) {
	var cntxtDtls = "in updateoffertaglineimage";
	var QRY_TO_EXEC = `UPDATE shop_offers_tbl SET tagline_image = ? WHERE id = ?`;
	let value = [imagekitUrl, insertId]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.getoffer = function (data, callback) {
	var cntxtDtls = "in getoffer";
	var QRY_TO_EXEC = `SELECT a.*,d.category_name,(SELECT GROUP_CONCAT(b.shop_name SEPARATOR ', ') FROM shop_list_t b WHERE FIND_IN_SET(b.id, a.shop_id)) AS shop_names,c.location_name FROM shop_offers_tbl a LEFT JOIN location_tbl c ON a.location_id = c.id LEFT JOIN category_tbl as d ON d.id = a.category_id WHERE a.d_in = 0 `;

	var params = [];
	if (data.filters && data.filters.location !== undefined && data.filters.location !== '') {
		if (data.filters.location != "0") {
			QRY_TO_EXEC += ` AND a.location_id = ?`;
			params.push(data.filters.location);
		}
	} else {
		return callback(null, []);
	}

	if (params.length === 0 && data.filters.location != "0") {
		return callback(null, []);  // Ensures empty filter returns no data
	}
	QRY_TO_EXEC += ` ORDER BY a.id DESC;`;

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updateoffer = function (data, imageUploadbanner, imageUploadtagline, callback) {
	var cntxtDtls = "in updateoffer";
	const shopIdArray = data.shop_id;
	const shopIdsAsString = shopIdArray.join(',');
	var QRY_TO_EXEC = `update shop_offers_tbl set location_id = ?,category_id = ?,shop_id = ?,banner_image = ?,offer_title = ?,offer_tag_line = ?,tagline_image = ?,veg_mode = ? where id = ?;`;
	var params = [data.location_id, data.category_id, shopIdsAsString, imageUploadbanner, data.offer_title, data.offer_tag_line, imageUploadtagline, data.veg_mode, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.deleteoffer = function (data, callback) {
	var cntxtDtls = "in deleteoffer";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		var QRY_TO_EXEC = `Update shop_offers_tbl set d_in=1 where id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};


exports.addbanner = function (data, imageupload, callback) {
	var cntxtDtls = "in addbanner";
	var createddate = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
	let itemIdsAsString = '';
	if (Array.isArray(data.item_id)) {
		itemIdsAsString = data.item_id.join(',');
	} else {
		itemIdsAsString = String(data.item_id || '');
	}
	var QRY_TO_EXEC = `INSERT INTO banners_lst_t (location_id,location_name,banner_image,category_id,item_id,item_name,banner_offer_title,banner_type,i_ts) VALUES (?,?,?,?,?,?,?,?,?);`;
	let params = [data.location_id, data.location_name, imageupload, data.category_id || null, itemIdsAsString, data.item_name, data.banner_offer_title || '', data.banner_type, createddate];

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};



exports.getbanner = function (data, callback) {
	var cntxtDtls = "in getbanner";
	var QRY_TO_EXEC = `SELECT a.* FROM banners_lst_t as a WHERE a.d_in = 0 `;

	var params = [];

	// no location (or "All") -> return every banner
	if (data.filters && data.filters.location && data.filters.location != "0") {
		QRY_TO_EXEC += ` AND a.location_id = ?`;
		params.push(data.filters.location);
	}

	QRY_TO_EXEC += ` ORDER BY a.id DESC;`;

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatebanner = function (data, imageupload, callback) {
	var cntxtDtls = "in updatebanner";
	// const itemIdArray = data.item_id;
	// const itemIdsAsString = itemIdArray.join(',');
	let itemIdsAsString = '';
	if (Array.isArray(data.item_id)) {
		itemIdsAsString = data.item_id.join(',');
	} else {
		itemIdsAsString = String(data.item_id || '');
	}
	var QRY_TO_EXEC = `update banners_lst_t set location_id = ?,location_name = ?,category_id = ?,item_id = ?,item_name = ?,banner_offer_title = ?,banner_image = ?,banner_type = ? where id = ?;`;
	var params = [data.location_id, data.location_name, data.category_id || null, itemIdsAsString, data.item_name, data.banner_offer_title || '', imageupload, data.banner_type, data.id];
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};


exports.deletebanner = function (data, callback) {
	var cntxtDtls = "in deletebanner";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		var QRY_TO_EXEC = `Update banners_lst_t set d_in=1 where id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};





exports.updatebannerimageintables = function (imagekitUrl, insertId, callback) {
	var cntxtDtls = "in updatebannerimageintables";
	var QRY_TO_EXEC = `UPDATE banners_lst_t SET banner_image = ? WHERE id = ?`;
	let value = [imagekitUrl, insertId]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};


exports.adddeliveryboybanner = function (data, imageupload, callback) {
	var cntxtDtls = "in adddeliveryboybanner";
	var createddate = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");

	var QRY_TO_EXEC = `
		INSERT INTO deliveryboys_banners_t 
		(location_id, banner_image, i_ts) 
		VALUES (?,?,?);
	`;

	let params = [data.location_id, imageupload, createddate];

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	} else {
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
	}
};

exports.getdeliveryboybanner = function (data, callback) {
	var cntxtDtls = "in getdeliveryboybanner";

	var QRY_TO_EXEC = `SELECT 
    a.*, 
    CASE 
        WHEN a.location_id = 0 THEN 'All'
        ELSE b.location_name 
    END AS location_name
FROM deliveryboys_banners_t a
LEFT JOIN location_tbl b 
    ON a.location_id = b.id
WHERE a.d_in = 0 `;

	var params = [];

	if (data.filters && data.filters.location2 && data.filters.location2 != "0") {
		QRY_TO_EXEC += ` AND a.location_id = ?`;
		params.push(data.filters.location2);
	}

	QRY_TO_EXEC += ` ORDER BY a.id DESC;`;

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	} else {
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
	}
};

exports.updatedeliveryboybanner = function (data, imageupload, callback) {
	var cntxtDtls = "in updatedeliveryboybanner";

	var QRY_TO_EXEC = `
		UPDATE deliveryboys_banners_t 
		SET location_id = ?, banner_image = ? 
		WHERE id = ?;
	`;

	var params = [data.location_id, imageupload, data.id];

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	} else {
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
	}
};

exports.deletedeliveryboybanner = function (data, callback) {
	var cntxtDtls = "in deletedeliveryboybanner";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		var QRY_TO_EXEC = `Update deliveryboys_banners_t set d_in=1 where id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.addcategorybanner = function (data, imageupload, callback) {
	var cntxtDtls = "in addcategorybanner";
	var createddate = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
	var QRY_TO_EXEC = `INSERT INTO category_banners_t (location_id,location_name,category_id,category_name,categorybanner_image,entry_by,i_ts) VALUES (?,?,?,?,?,?,?);`;
	let params = [data.location_id, data.location_name, data.category_id, data.category_name, imageupload, data.entry_by, createddate]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getcategorybanner = function (data, callback) {
	var cntxtDtls = "in getcategorybanner";
	var QRY_TO_EXEC = `SELECT a.* FROM category_banners_t as a WHERE a.d_in = 0 `;

	var params = [];

	if (data.filters && data.filters.location1 && data.filters.location1 != "0") {
		QRY_TO_EXEC += ` AND a.location_id = ?`;
		params.push(data.filters.location1);
	}

	QRY_TO_EXEC += ` ORDER BY a.id DESC;`;

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};


exports.updatecategorybanner = function (data, imageupload, callback) {
	var cntxtDtls = "in updatecategorybanner";
	var QRY_TO_EXEC = `update category_banners_t set location_id = ?,location_name = ?,category_id = ?,category_name = ?,categorybanner_image = ? where id = ?;`;
	var params = [data.location_id, data.location_name, data.category_id, data.category_name, imageupload, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.deletecategorybanner = function (data, callback) {
	var cntxtDtls = "in deletecategorybanner";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		var QRY_TO_EXEC = `Update category_banners_t set d_in=1 where id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.addnotifications = function (data, imageupload, callback) {
	var cntxtDtls = "in addnotifications";
	var createddate = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
	var QRY_TO_EXEC = `INSERT INTO notifications_t (notification_title,notification_description,location_id,location_name,notification_image,entry_by,i_ts) VALUES (?,?,?,?,?,?,?);`;
	let params = [data.notification_title, data.notification_description, data.location_id, data.location_name, imageupload, data.entry_by, createddate]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getplayeridsfornotifications = function (data, imageupload, callback) {
	var cntxtDtls = "in getplayeridsfornotifications";
	let QRY_TO_EXEC = "";
	let params = [];

	if (data.location_id == 0) {
		QRY_TO_EXEC = `SELECT player_id FROM player_ids_list_t WHERE user_type = 0 AND player_id !="null" AND user_id!=0 AND CHAR_LENGTH(player_id) < 50 GROUP BY player_id`;
	} else {
		QRY_TO_EXEC = `SELECT player_id FROM player_ids_list_t WHERE user_type = 0 AND player_id !="null" AND user_id!=0 AND location_id = ? AND CHAR_LENGTH(player_id) < 50 GROUP BY player_id`;
		params = [data.location_id];
	}

	if (callback && typeof callback === "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
		});
	} else {
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
	}
};

exports.getnotifications = function (data, callback) {
	var cntxtDtls = "in getnotifications";
	var QRY_TO_EXEC = `SELECT a.* FROM notifications_t as a WHERE a.d_in = 0 `;

	var params = [];

	// no location (or "All") -> return every notification
	if (data.filters && data.filters.location && data.filters.location != "0") {
		QRY_TO_EXEC += ` AND a.location_id = ?`;
		params.push(data.filters.location);
	}

	QRY_TO_EXEC += ` ORDER BY a.id DESC;`;

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatenotifications = function (data, imageupload, callback) {
	var cntxtDtls = "in updatenotifications";
	var QRY_TO_EXEC = `update notifications_t set notification_title = ?,notification_description = ?, location_id = ?,location_name = ?,notification_image = ? where id = ?;`;
	var params = [data.notification_title, data.notification_description, data.location_id, data.location_name, imageupload, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.deletenotifications = function (data, callback) {
	var cntxtDtls = "in deletenotifications";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		var QRY_TO_EXEC = `Update notifications_t set d_in=1 where id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.addschedulenotification = function (data, imageupload, callback) {
	var cntxtDtls = "in addschedulenotification";
	var createddate = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
	var QRY_TO_EXEC = `INSERT INTO schedule_notifications_t (notification_date,notification_time,notification_title,notification_description,location_id,location_name,notification_image) VALUES (?,?,?,?,?,?,?);`;
	let params = [data.notification_date, data.notification_time, data.notification_title, data.notification_description, data.location_id, data.location_name, imageupload]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getschedulenotification = function (data, callback) {
	var cntxtDtls = "in getschedulenotification";
	var QRY_TO_EXEC = `SELECT a.* FROM schedule_notifications_t as a WHERE a.d_in = 0 `;

	var params = [];

	if (data.filters && data.filters.location1 && data.filters.location1 != "0") {
		QRY_TO_EXEC += ` AND a.location_id = ?`;
		params.push(data.filters.location1);
	}

	QRY_TO_EXEC += ` ORDER BY a.id DESC;`;

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updateschedulenotification = function (data, imageupload, callback) {
	var cntxtDtls = "in updateschedulenotification";
	var QRY_TO_EXEC = `update schedule_notifications_t set notification_date = ?,notification_time = ?,notification_title = ?,notification_description = ?, location_id = ?,location_name = ?,notification_image = ? where id = ?;`;
	var params = [data.notification_date, data.notification_time, data.notification_title, data.notification_description, data.location_id, data.location_name, imageupload, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.deleteschedulenotification = function (data, callback) {
	var cntxtDtls = "in deleteschedulenotification";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		var QRY_TO_EXEC = `Update schedule_notifications_t set d_in=1 where id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.addcoupon = function (data, callback) {
	var cntxtDtls = "in addcoupon";
	var QRY_TO_EXEC = `INSERT INTO coupon_code_t (location_id,location_name,category_id,shop_id,coupon_name,coupon_description,coupon_percentage,coupon_upto_price,coupon_max_price_limit,entry_by,usage_limit) VALUES (?,?,?,?,?,?,?,?,?,?,?);`;
	let params = [data.location_id, data.location_name, data.category_id, data.shop_id, data.coupon_name, data.coupon_description, data.coupon_percentage, data.coupon_upto_price, data.coupon_max_price_limit, data.entry_by, data.usage_limit]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

// exports.getcoupon = function (data, callback) {
// 	var cntxtDtls = "in getcoupon";
// 	var QRY_TO_EXEC = `SELECT a.*, CASE WHEN a.shop_id = 0 THEN 'All' ELSE b.shop_name END AS shop_name,c.category_name FROM coupon_code_t AS a LEFT JOIN shop_list_t AS b ON b.id = a.shop_id LEFT JOIN category_tbl as c ON c.id = a.category_id WHERE a.d_in = 0 `;
// 	var params = [];

// 	if (data.filters && data.filters.location !== undefined && data.filters.location !== '') {
// 		if (data.filters.location != "0") {
// 			QRY_TO_EXEC += ` AND a.location_id = ?`;
// 			params.push(data.filters.location);
// 		}
// 	} else {
// 		return callback(null, []);
// 	}

// 	if (params.length === 0 && data.filters.location != "0") {
// 		return callback(null, []);  // Ensures empty filter returns no data
// 	}

// 	QRY_TO_EXEC += ` ORDER BY a.id DESC;`;

// 	if (callback && typeof callback == "function") {
// 		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
// 			callback(err, results);
// 			return;
// 		});
// 	}
// 	else
// 		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
// };

exports.getcoupon = function (data, callback) {
	var cntxtDtls = "in getcoupon";
	var QRY_TO_EXEC = `SELECT a.*, CASE WHEN a.shop_id = 0 THEN 'All' ELSE b.shop_name END AS shop_name,c.category_name FROM coupon_code_t AS a LEFT JOIN shop_list_t AS b ON b.id = a.shop_id LEFT JOIN category_tbl as c ON c.id = a.category_id WHERE a.d_in = 0 `;
	var params = [];

	// no location (or "All") -> return every coupon
	if (data.filters && data.filters.location && data.filters.location != "0") {
		QRY_TO_EXEC += ` AND a.location_id = ?`;
		params.push(data.filters.location);
	}

	QRY_TO_EXEC += ` ORDER BY a.id DESC;`;

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatecoupon = function (data, callback) {
	var cntxtDtls = "in updatecoupon";
	var QRY_TO_EXEC = `update coupon_code_t set coupon_name = ?,coupon_description = ?, location_id = ?,location_name = ? ,category_id = ? ,shop_id = ?,coupon_percentage = ? ,coupon_upto_price = ?,coupon_max_price_limit = ?,usage_limit = ? where id = ?;`;
	var params = [data.coupon_name, data.coupon_description, data.location_id, data.location_name, data.category_id, data.shop_id, data.coupon_percentage, data.coupon_upto_price, data.coupon_max_price_limit, data.usage_limit, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.deletecoupon = function (data, callback) {
	var cntxtDtls = "in deletecoupon";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		var QRY_TO_EXEC = `Update coupon_code_t set d_in=1 where id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatecouponstatus = function (data, callback) {
	var cntxtDtls = "in updatecouponstatus";
	var QRY_TO_EXEC = `update coupon_code_t set coupon_status = ? where id = ?;`;
	var params = [data.coupon_status, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatecouponactivestatus = function (data, callback) {
	var cntxtDtls = "in updatecouponactivestatus";
	var QRY_TO_EXEC = `update coupon_code_t set coupon_active_status = ? where id = ?;`;
	var params = [data.coupon_active_status, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.adddeliveryboy = function (data, imageUploadaadhar, imageUploaddriving, imageUploadpancard, imageUploadbank, imageUploadrcbook, callback) {
	var cntxtDtls = "in adddeliveryboy";
	let randomOTP = Math.floor(100000 + Math.random() * 900000);
	let randomOTP1 = Math.floor(100000 + Math.random() * 900000);

	var GET_LAST_ID = `SELECT id FROM delivery_boy_t ORDER BY id DESC LIMIT 1;`;

	dbutil.sqlinjection(sqldb.MySQLConPool, GET_LAST_ID, [], cntxtDtls, (err, results) => {
		if (err) return callback(err, null);

		let lastId = results.length > 0 && results[0].id ? results[0].id : 0;
		let newId = lastId + 1;
		let deliveryboyCode = `A-DELE-${String(newId).padStart(3, "0")}`;

		var QRY_TO_EXEC = `INSERT INTO delivery_boy_t (delivery_boy_name,delivery_boy_mobile_number,delivery_boy_password,delivery_boy_address,delivery_boy_location_id,delivery_boy_aadhar,delivery_boy_driving_lic,delivery_boy_pancard,delivery_boy_bankdetails,delivery_boy_rcbook,aadhar_image,driving_license_image,pancard_image,bank_details_image,rc_book_image,entry_by,deliveryboy_payment_otp,delivery_boy_code,deliveryboy_wallet_amount,cod_otp,cod_limit) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;

		let params = [data.delivery_boy_name, data.delivery_boy_mobile_number, data.delivery_boy_password, data.delivery_boy_address, data.delivery_boy_location_id, data.delivery_boy_aadhar, data.delivery_boy_driving_lic, data.delivery_boy_pancard, data.delivery_boy_bankdetails, data.delivery_boy_rcbook, imageUploadaadhar, imageUploaddriving, imageUploadpancard, imageUploadbank, imageUploadrcbook, data.entry_by, randomOTP, deliveryboyCode, '0', randomOTP1, data.cod_limit];

		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, callback);
	});
};

exports.checkDeliveryBoyNumberMdl = function (data, callback) {
	var cntxtDtls = "in checkDeliveryBoyNumberMdl";
	var QRY_TO_EXEC = `SELECT * FROM delivery_boy_t WHERE delivery_boy_mobile_number = ? AND d_in = 0;`;
	let params = [data.delivery_boy_mobile_number];
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getdeliveryboy = function (callback) {
	var cntxtDtls = "in getdeliveryboy";
	var QRY_TO_EXEC = `SELECT a.*,b.location_name FROM delivery_boy_t as a LEFT JOIN location_tbl as b ON a.delivery_boy_location_id = b.id WHERE a.d_in = 0 ORDER BY a.id DESC;`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};


exports.getdeliveryboylist = function (callback) {
	var cntxtDtls = "in getdeliveryboylist";
	var QRY_TO_EXEC = `SELECT a.*, b.location_name FROM delivery_boy_t AS a LEFT JOIN location_tbl AS b ON a.delivery_boy_location_id = b.id WHERE a.d_in = 0 ORDER BY a.id DESC;`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.getdeliveryboy = function (data, callback) {
	var cntxtDtls = "in getdeliveryboy";
	let QRY_TO_EXEC = `SELECT a.*, b.location_name FROM delivery_boy_t AS a LEFT JOIN location_tbl AS b ON a.delivery_boy_location_id = b.id WHERE a.d_in = 0 `;
	let params = [];

	if (data.admin_type_id == '2' && data.location_id) {
		QRY_TO_EXEC += " AND a.delivery_boy_location_id = ?";
		params.push(data.location_id);
	}

	QRY_TO_EXEC += " ORDER BY a.id DESC;";
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatedeliveryboy = function (data, imageUploadaadhar, imageUploaddriving, imageUploadpancard, imageUploadbank, imageUploadrcbook, callback) {
	var cntxtDtls = "in updatedeliveryboy";
	var QRY_TO_EXEC = `update delivery_boy_t set delivery_boy_name = ?,delivery_boy_mobile_number = ?,delivery_boy_address = ?,delivery_boy_location_id = ?,delivery_boy_aadhar = ?,delivery_boy_driving_lic = ?,delivery_boy_pancard = ?,delivery_boy_bankdetails = ?,delivery_boy_rcbook = ?,aadhar_image = ?, driving_license_image = ?, pancard_image = ?,bank_details_image = ?,rc_book_image = ?,cod_limit = ? where id = ?;`;
	var params = [data.delivery_boy_name, data.delivery_boy_mobile_number, data.delivery_boy_address, data.delivery_boy_location_id, data.delivery_boy_aadhar, data.delivery_boy_driving_lic, data.delivery_boy_pancard, data.delivery_boy_bankdetails, data.delivery_boy_rcbook, imageUploadaadhar, imageUploaddriving, imageUploadpancard, imageUploadbank, imageUploadrcbook, data.cod_limit, data.id]

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.deletedeliveryboy = function (data, callback) {
	var cntxtDtls = "in deletedeliveryboy";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		var QRY_TO_EXEC = `Update delivery_boy_t set d_in=1 where id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatedeliveryboyactivestatus = function (data, callback) {
	var cntxtDtls = "in updatedeliveryboyactivestatus";
	var QRY_TO_EXEC = `update delivery_boy_t set delivery_boy_active_status = ? where id = ?;`;
	var params = [data.delivery_boy_active_status, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatedeliveryexecutivestatus = function (data, callback) {
	var cntxtDtls = "in updatedeliveryexecutivestatus";
	var QRY_TO_EXEC = `update delivery_boy_t set delivery_boy_executive_type = ? where id = ?;`;
	var params = [data.value, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getdeliveryboysforpayments = function (data, callback) {
	var cntxtDtls = "in getdeliveryboysforpayments";
	var QRY_TO_EXEC = `SELECT a.id,a.deliveryboy_payment_otp,a.delivery_boy_name,a.delivery_boy_mobile_number,a.incentive_amount, b.delivery_boy_id as deliveryboy_id, COUNT(b.id) AS total_orders, CONCAT(MIN(b.order_date), ' - ', MAX(b.order_date)) AS date_range, ROUND(SUM(b.grand_total),2) AS total_amount, JSON_ARRAYAGG(b.id) AS order_ids, SUM(b.deliveryboy_delivery_charges) AS delivery_charges, SUM(CASE WHEN b.payment_type = 'Cash on Delivery' THEN 1 ELSE 0 END) AS cod_count, SUM(CASE WHEN b.payment_type = 'Pay Online' THEN 1 ELSE 0 END) AS pay_online_count, ROUND(SUM(CASE WHEN b.payment_type = 'Cash on Delivery' THEN b.grand_total ELSE 0 END),2) AS cod_amount, ROUND(SUM(CASE WHEN b.payment_type = 'Pay Online' THEN b.grand_total ELSE 0 END),2) AS pay_online_amount FROM order_lst_t AS b JOIN delivery_boy_t as a ON a.id = b.delivery_boy_id WHERE b.delivery_boy_payment_status = 0 AND b.order_status = 3 `;

	var params = [];

	if (data.filters.location) {
		QRY_TO_EXEC += ` AND a.delivery_boy_location_id = ?`;
		params.push(data.filters.location);
	}

	// 	if (data.filters.exec_type) {
	// 		if (data.filters.exec_type == 1) {
	// 			QRY_TO_EXEC += ` AND b.category_id = ?`;
	// 			params.push(4);
	// 		} else if (data.filters.exec_type == 2) {
	// 			QRY_TO_EXEC += ` AND b.category_id != ?`;
	// 			params.push(4);
	// 		}
	// 	}

	if (data.filters.fromdate && data.filters.todate) {
		QRY_TO_EXEC += ` AND DATE(b.order_date) BETWEEN ? AND ?`;
		params.push(data.filters.fromdate, data.filters.todate);
	}

	QRY_TO_EXEC += ` GROUP BY a.id `;

	if (params.length === 0) {
		return callback(null, []);
	}

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getdeliveryboyincentivesamount = function (data, callback) {
	var cntxtDtls = "in getdeliveryboyincentivesamount";
	var QRY_TO_EXEC = `Select a.order_deliverd_date_time,DATE_FORMAT(a.order_deliverd_date_time, '%d-%m-%Y %l:%i%p') AS order_deliverd_date,COUNT(a.id) as total_orders_per_day FROM order_lst_t as a where a.delivery_boy_id = ? AND a.order_status = ? AND a.delivery_boy_payment_status = ? `;

	let value = [data.delivery_boy_id, 3, 0]

	// 	if (data.delivery_boy_executive_type == 2) {
	// 		QRY_TO_EXEC += ` AND a.category_id != ?`;
	// 		value.push(4);
	// 	} else {
	// 		QRY_TO_EXEC += ` AND a.category_id = ?`;
	// 		value.push(4);
	// 	}

	QRY_TO_EXEC += ` GROUP BY DATE(a.order_deliverd_date_time)`;

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.getincentivesdata = function (data, callback) {
	var cntxtDtls = "in getincentivesdata";
	var QRY_TO_EXEC = `SELECT a.incentive_range as order_count, a.incentive_amount as each_order_earn FROM deliveryboys_incentives as a WHERE a.location_id = ?`;

	// 	var QRY_TO_EXEC = `SELECT a.incentive_range as order_count, a.incentive_amount as each_order_earn FROM deliveryboys_incentives as a WHERE a.d_in = 0 `;
	// let value = [];
	// if (data.location_id) {
	// 	QRY_TO_EXEC += ` AND a.location_id = ? `;
	// 	value.push(data.location_id);
	// }
	// QRY_TO_EXEC += ` ORDER BY a.incentive_range ASC `;

	let value = [data.location];

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.submitdeliveryboypayments = function (data, callback) {
	var cntxtDtls = "in submitdeliveryboypayments";
	var createddate = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
	var QRY_TO_EXEC = `INSERT INTO deliveryboy_payment_t (deliveryboy_id,payment_dates,payment_date_time,order_ids,total_orders, total_amount,delivery_charges,total_incentives_amount,cod_orders,cod_amount,payonline_orders,payonline_amount,total_payment_amount,payment_method,payment_transaction_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
	let value = [data.id, data.date_range, createddate, JSON.stringify(data.order_ids), data.total_orders, data.total_amount, data.delivery_charges, data.total_incentives_amount, data.cod_count, data.cod_amount, data.pay_online_count, data.pay_online_amount, data.total_payment_amount, data.payment_method, data.payment_transaction_id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.submitdeliveryboypaymentincentives = function (Insertid, data, callback) {
	var cntxtDtls = "in submitdeliveryboypaymentincentives";
	var host = data.incentivesdata;
	var QRY_TO_EXEC = '';
	var MU_QRY_TO_EXEC = '';
	let params = [];
	for (let i = 0; i < host.length; i++) {
		QRY_TO_EXEC = `INSERT INTO deliveryboy_payment_incentives_t (payment_id,order_date_time,total_orders_per_day,each_order_earn,total_incentive_amount) VALUES (?,?,?,?,?);`;
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(Insertid, host[i].order_deliverd_date_time, host[i].total_orders_per_day, host[i].each_order_earn, host[i].total_incentive);
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatedeliveryboypaymentstatus = function (data, callback) {
	var cntxtDtls = "in updatedeliveryboypaymentstatus";
	var host = Array.isArray(data.order_ids) ? data.order_ids : JSON.parse(data.order_ids);
	var QRY_TO_EXEC = '';
	var MU_QRY_TO_EXEC = '';
	let params = [];
	for (let i = 0; i < host.length; i++) {
		QRY_TO_EXEC = `UPDATE order_lst_t SET delivery_boy_payment_status = ? where id = ? ;`;
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push('1', host[i]);
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatedeliveryboypaymentotp = function (data, callback) {
	var cntxtDtls = "in updatedeliveryboypaymentotp";
	let randomOTP = Math.floor(100000 + Math.random() * 900000);
	var QRY_TO_EXEC = `UPDATE delivery_boy_t set deliveryboy_payment_otp = ?,incentive_amount = ? where id = ? ;`;
	let value = [randomOTP, 0, data.deliveryboy_id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.getdeliveryboypaymenthistory = function (data, callback) {

	var cntxtDtls = "in getdeliveryboypaymenthistory";
	var QRY_TO_EXEC = `SELECT a.*,b.delivery_boy_name,b.delivery_boy_mobile_number,b.delivery_boy_location_id,DATE_FORMAT(a.payment_date_time, '%Y-%m-%d %H:%i:%s') AS settlement_date_time FROM deliveryboy_payment_t as a LEFT JOIN delivery_boy_t as b ON a.deliveryboy_id = b.id WHERE 1=1 `;

	var params = [];

	if (data.filters.fromdate && data.filters.todate) {
		QRY_TO_EXEC += ` AND DATE(a.payment_date_time) BETWEEN ? AND ?`;
		params.push(data.filters.fromdate, data.filters.todate);
	}

	if (data.filters.location) {
		QRY_TO_EXEC += ` AND b.delivery_boy_location_id = ?`;
		params.push(data.filters.location);
	}

	if (data.filters.deliveryboy) {
		QRY_TO_EXEC += ` AND b.id = ?`;
		params.push(data.filters.deliveryboy);
	}

	// 	if (data.filters.exec_type) {
	// 		QRY_TO_EXEC += ` AND a.executive_mode = ?`;
	// 		params.push(data.filters.exec_type);
	// 	}

	QRY_TO_EXEC += ` ORDER BY a.id desc`;

	if (params.length === 0) {
		return callback(null, []);
	}

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getdelboypaymentincentiveshistory = function (data, callback) {
	var cntxtDtls = "in getdelboypaymentincentiveshistory";
	var QRY_TO_EXEC = `select * From deliveryboy_payment_incentives_t where payment_id = ? ;`;
	let value = [data.payment_id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.getcodamounts = function (data, callback) {
	var cntxtDtls = "in getcodamounts";
	var QRY_TO_EXEC = `SELECT a.id, a.delivery_boy_name, a.delivery_boy_mobile_number, b.delivery_boy_id AS deliveryboy_id,a.cod_otp,DATE_FORMAT(b.order_date, '%d-%m-%Y') AS order_date, CONCAT(MIN(b.order_date), ' - ', MAX(b.order_date)) AS date_range, COUNT(b.id) AS total_orders, ROUND(SUM(b.grand_total),2) AS total_amount, JSON_ARRAYAGG(b.id) AS order_ids, SUM(CASE WHEN b.payment_type = 'Cash on Delivery' THEN 1 ELSE 0 END) AS cod_count, ROUND(SUM(CASE WHEN b.payment_type = 'Cash on Delivery' THEN b.grand_total ELSE 0 END),2) AS cod_amount FROM order_lst_t AS b JOIN delivery_boy_t AS a ON a.id = b.delivery_boy_id WHERE b.cod_settlement_status = 0 AND b.order_status = 3 AND b.payment_type = 'Cash on Delivery' AND a.d_in = 0`;

	var params = [];

	if (data.filters && data.filters.location !== undefined && data.filters.location !== '') {
		if (data.filters.location != "0") {
			QRY_TO_EXEC += ` AND a.delivery_boy_location_id = ?`;
			params.push(data.filters.location);
		}
	} else {
		return callback(null, []);
	}

	if (params.length === 0 && data.filters.location != "0") {
		return callback(null, []);  // Ensures empty filter returns no data
	}

	QRY_TO_EXEC += ` GROUP BY a.id ORDER BY a.id, DATE(b.order_date);`;
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.addfranchise = function (data, imageUploadaadhar, imageUploadpancard, imageUploadbank, callback) {
	var cntxtDtls = "in addfranchise";
	let locationIdString = Array.isArray(data.location_id) ? data.location_id.join(",") : data.location_id;
	let randomOTP = Math.floor(100000 + Math.random() * 900000);
	var QRY_TO_EXEC = `INSERT INTO franchise_t (franchise_name,franchise_mobile_number,franchise_email,franchise_password,franchise_aadhar,franchise_aadhar_image,franchise_pancard,franchise_pancard_image,franchise_bankdetails,location_id,entry_by,settlement_otp) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);`;
	let params = [data.franchise_name, data.franchise_mobile_number, data.franchise_email, data.franchise_password, data.franchise_aadhar, imageUploadaadhar, data.franchise_pancard, imageUploadpancard, imageUploadbank, locationIdString, data.entry_by, randomOTP]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatefranchiseidintolocation = function (insertId, data, callback) {
	var cntxtDtls = "in updatefranchiseidintolocation";
	var host = data.location_id
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (let i = 0; i < host.length; i++) {
		QRY_TO_EXEC = `Update location_tbl set franchise_id = ? where id = ?;`;
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(insertId, host[i]);
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.addfranchisedatainuserstbl = function (insertId, data, callback) {
	var cntxtDtls = "in addfranchisedatainuserstbl";
	var QRY_TO_EXEC = `INSERT INTO users (admin_type ,name ,number ,shop_id,email, pwd) VALUES (?,?,?,?,?,?);`;
	let value = ['2', data.franchise_name, data.franchise_mobile_number, insertId, data.franchise_email, data.franchise_password]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.addfranchisepermissions = function (insertId, data, callback) {
	var cntxtDtls = "in addfranchisepermissions";
	var host = [
		{ module_id: 5, sub_module_id: 4 },
		{ module_id: 5, sub_module_id: 5 },
		{ module_id: 5, sub_module_id: 32 },
		{ module_id: 5, sub_module_id: 10 },
		{ module_id: 5, sub_module_id: 14 },
		// 		{ module_id: 8, sub_module_id: 11 },
// 		{ module_id: 8, sub_module_id: 21 },
		{ module_id: 4, sub_module_id: 6 },
		{ module_id: 4, sub_module_id: 22 },
		{ module_id: 6, sub_module_id: 26 },
		{ module_id: 11, sub_module_id: 28 },
		{ module_id: 11, sub_module_id: 29 },
		{ module_id: 12, sub_module_id: 9 },
		{ module_id: 12, sub_module_id: 30 },
		{ module_id: 12, sub_module_id: 31 },
		{ module_id: 12, sub_module_id: 42 },
		{ module_id: 12, sub_module_id: 45 },
		{ module_id: 15, sub_module_id: 43 },
		{ module_id: 15, sub_module_id: 44 }

	];
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (let i = 0; i < host.length; i++) {
		QRY_TO_EXEC = `insert into admin_permission (user_id,module_id,sub_module_id) values(?,?,?);`;
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(insertId, host[i].module_id, host[i].sub_module_id);
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getfranchise = function (callback) {
	var cntxtDtls = "in getfranchise";
	var QRY_TO_EXEC = `SELECT a.*, GROUP_CONCAT(b.location_name ORDER BY FIELD(b.id, a.location_id) SEPARATOR ', ') AS location_names FROM franchise_t AS a LEFT JOIN location_tbl AS b ON FIND_IN_SET(b.id, a.location_id) WHERE a.d_in = 0 GROUP BY a.id ORDER BY a.id DESC;`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.updatefranchise = function (data, imageUploadaadhar, imageUploadpancard, imageUploadbank, callback) {
	var cntxtDtls = "in updatefranchise";
	let locationIdString = Array.isArray(data.location_id) ? data.location_id.join(",") : data.location_id;
	var QRY_TO_EXEC = `update franchise_t set franchise_name = ?,franchise_mobile_number = ?,franchise_email = ?,franchise_aadhar = ?,franchise_aadhar_image = ?,franchise_pancard = ?,franchise_pancard_image = ?,franchise_bankdetails = ?,location_id = ? where id = ?;`;
	var params = [data.franchise_name, data.franchise_mobile_number, data.franchise_email, data.franchise_aadhar, imageUploadaadhar, data.franchise_pancard, imageUploadpancard, imageUploadbank, locationIdString, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.editfranchiseidinlocation = function (data, callback) {
	var cntxtDtls = "in editfranchiseidinlocation";
	let locations = Array.isArray(data.location_id) ? data.location_id : [data.location_id];
	var MU_QRY_TO_EXEC = '';
	var params = [];

	let resetQuery = `UPDATE location_tbl SET franchise_id = 0 WHERE franchise_id = ?;`;
	MU_QRY_TO_EXEC += resetQuery;
	params.push(data.id);

	locations.forEach(locationId => {
		MU_QRY_TO_EXEC += ` UPDATE location_tbl SET franchise_id = ? WHERE id = ?;`;
		params.push(data.id, locationId);
	});
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	} else {
		return dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls);
	}
};

exports.editfranchiseidinusers = function (data, callback) {
	var cntxtDtls = "in editfranchiseidinusers";
	var QRY_TO_EXEC = `UPDATE users SET name = ?,number = ?,email = ? WHERE shop_id = ? and admin_type = 2;`;
	let value = [data.franchise_name, data.franchise_mobile_number, data.franchise_email, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.deletefranchise = function (data, callback) {
	var cntxtDtls = "in deletefranchise";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		var QRY_TO_EXEC = `Update franchise_t set d_in=1 where id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatefranchiseloginstatus = function (data, callback) {
	var cntxtDtls = "in updatefranchiseloginstatus";
	var QRY_TO_EXEC = `update franchise_t set login_status = ? where id = ?;`;
	var params = [data.login_status, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getfranchisesettlements = function (data, callback) {
	var cntxtDtls = "in getfranchisesettlements";

	let params = [];
	let whereClause = " WHERE o.order_status = 3 AND a.d_in = 0 AND franchise_payment_status = 0 ";

	// Check admin_type
	if (data.admin_type == 2 && data.franchise_id) {
		whereClause += " AND a.id = ? ";
		params.push(data.franchise_id);
	}

	var QRY_TO_EXEC = `SELECT a.id, a.franchise_name, a.franchise_mobile_number,a.settlement_otp, a.location_id, l.location_name, COUNT(o.id) AS total_orders, ROUND(SUM(o.grand_total), 2) AS total_amount, ROUND(SUM(o.delivery_charges), 2) AS total_deliverycharges, ROUND(SUM(o.delivery_charges_gst), 2) AS total_deliverygst, ROUND(SUM(o.packing_charges), 2) AS total_packingcharges, ROUND(SUM(o.packing_charges_gst), 2) AS total_packinggst, ROUND(SUM(o.handling_charges), 2) AS platform_charges, ROUND(SUM(o.gstonplatform_fee), 2) AS platform_charges_gst, ROUND(SUM(o.total_item_gst_amount), 2) AS total_itemgst, ROUND(SUM(o.surcharges), 2) AS surcharges,ROUND(SUM(o.donation_charges), 2) AS donation_charges, JSON_ARRAYAGG(o.id) AS order_ids, CONCAT(MIN(o.order_date), ' - ', MAX(o.order_date)) AS date_range, ROUND((SUM(o.delivery_charges_gst) + SUM(o.donation_charges)  + SUM(o.surcharges) + SUM(o.total_item_gst_amount) + SUM(o.gstonplatform_fee) + SUM(o.handling_charges)),2) AS netPayable FROM franchise_t AS a LEFT JOIN location_tbl AS l ON l.id = a.location_id LEFT JOIN order_lst_t AS o ON o.location_id = a.location_id
        ${whereClause}
        GROUP BY a.id;`;

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	} else {
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
	}
};

exports.submitfranchisesettlement = function (data, callback) {
	var cntxtDtls = "in submitfranchisesettlement";
	var createddate = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
	var QRY_TO_EXEC = `INSERT INTO franchise_settlement (franchise_id, name, phone_number, location_id, dates, settlement_date, total_orders, order_amount, total_itemgst, total_deliverygst, platform_charges,platform_charges_gst, donation_charges, surcharges, netPayable, order_ids, payment_mode, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
	const values = [data.details.id, data.details.franchise_name, data.details.franchise_mobile_number, data.details.location_id, data.details.date_range, createddate, data.details.total_orders, data.details.total_amount, data.details.total_itemgst, data.details.total_deliverygst, data.details.platform_charges, data.details.platform_charges_gst, data.details.donation_charges, data.details.surcharges, data.details.netPayable, data.details.order_ids, data.payment_mode, data.transaction_id];

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.getfranchisesettlementhistory = function (data, callback) {
	var cntxtDtls = "in getfranchisesettlementhistory";
	var QRY_TO_EXEC = `SELECT a.*,b.franchise_name,b.franchise_mobile_number,DATE_FORMAT(a.settlement_date, '%Y-%m-%d') AS settlement_date_time FROM franchise_settlement as a LEFT JOIN franchise_t as b ON a.franchise_id = b.id WHERE 1=1 `;

	var params = [];

	// 	if (data.filters.fromdate && data.filters.todate) {
	// 		QRY_TO_EXEC += ` AND DATE(a.payment_date_time) BETWEEN ? AND ?`;
	// 		params.push(data.filters.fromdate, data.filters.todate);
	// 	}

	// 	if (data.filters.location) {
	// 		QRY_TO_EXEC += ` AND b.delivery_boy_location_id = ?`;
	// 		params.push(data.filters.location);
	// 	}

	if (data.filters.franchise) {
		QRY_TO_EXEC += ` AND a.franchise_id = ?`;
		params.push(data.filters.franchise);
	}

	QRY_TO_EXEC += ` ORDER BY a.id desc`;
	if (params.length === 0) {
		return callback(null, []);
	}

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatefranchisepaymentstatus = function (data, callback) {
	var cntxtDtls = "in updatefranchisepaymentstatus";
	var host = Array.isArray(data.details.order_ids) ? data.details.order_ids : JSON.parse(data.details.order_ids);
	var QRY_TO_EXEC = '';
	var MU_QRY_TO_EXEC = '';
	let params = [];
	for (let i = 0; i < host.length; i++) {
		QRY_TO_EXEC = `UPDATE order_lst_t SET franchise_payment_status = ? where id = ? ;`;
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push('1', host[i]);
	}

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatefranchisepaymentotp = function (data, callback) {
	var cntxtDtls = "in updatefranchisepaymentotp";
	let randomOTP = Math.floor(100000 + Math.random() * 900000);
	var QRY_TO_EXEC = `UPDATE franchise_t set settlement_otp = ? where id = ? ;`;
	let value = [randomOTP, data.details.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.addslottiming = function (data, callback) {
	var cntxtDtls = "in addslottiming";
	let slot_timings = `${data.from_time} - ${data.to_time}`;
	let slot_range = parseInt(data.from_time.substring(0, 2), 10);
	var QRY_TO_EXEC = `INSERT INTO slot_timings_t (slot_timings,end_time,location_id,location_name,slot_range,slot_date) VALUES (?,?,?,?,?,?);`;
	let params = [slot_timings, data.end_time, data.location_id, data.location_name, slot_range, data.slot_date]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getslottiming = function (data, callback) {
	var cntxtDtls = "in getslottiming";
	var QRY_TO_EXEC = `SELECT a.*, TRIM(SUBSTRING_INDEX(a.slot_timings, '-', 1)) AS from_time, TRIM(SUBSTRING_INDEX(a.slot_timings, '-', -1)) AS to_time, DATE_FORMAT(STR_TO_DATE(a.end_time, '%H:%i'), '%h:%i %p') AS end_time_ampm FROM slot_timings_t AS a WHERE a.d_in = 0 `;
	var params = [];

	if (data.filters && data.filters.location !== undefined && data.filters.location !== '') {
		if (data.filters.location != "0") {
			QRY_TO_EXEC += ` AND a.location_id = ?`;
			params.push(data.filters.location);
		}
	} else {
		return callback(null, []);
	}

	if (params.length === 0 && data.filters.location != "0") {
		return callback(null, []);  // Ensures empty filter returns no data
	}

	QRY_TO_EXEC += ` ORDER BY a.id DESC;`;

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updateslottiming = function (data, callback) {
	var cntxtDtls = "in updateslottiming";
	let slot_timings = `${data.from_time} - ${data.to_time}`;
	let slot_range = parseInt(data.from_time.substring(0, 2), 10);
	var QRY_TO_EXEC = `update slot_timings_t set slot_timings = ?,end_time = ?,location_id = ?,location_name = ?,slot_range = ?,slot_date = ? where id = ?;`;
	var params = [slot_timings, data.end_time, data.location_id, data.location_name, slot_range, data.slot_date, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.deleteslottiming = function (data, callback) {
	var cntxtDtls = "in deleteslottiming";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		var QRY_TO_EXEC = `Update slot_timings_t set d_in=1 where id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};


// ************* masters End **********//

// ************* masters End **********//

exports.getcustomerlist = function (data, callback) {
	var cntxtDtls = "in getcustomerlist";
	// 	var QRY_TO_EXEC = `SELECT a.*, COUNT(o.id) AS total_orders, SUM(CASE WHEN o.order_status = 3 THEN 1 ELSE 0 END) AS completed_orders, SUM(CASE WHEN o.order_status = 5 THEN 1 ELSE 0 END) AS rejected_orders, SUM(CASE WHEN o.order_status IN (1,2) THEN 1 ELSE 0 END) AS pending_orders FROM customer_list_t AS a LEFT JOIN order_lst_t AS o ON a.id = o.customer_id WHERE a.location_id = ? GROUP BY a.id ORDER BY a.id DESC;`;
	// 	let params = [data.filters.location]
	var QRY_TO_EXEC = `SELECT a.* FROM customer_list_t AS a GROUP BY a.id ORDER BY a.id DESC;`;
	let params = [data.filters.location]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getdeliveryboyslist = function (callback) {
	var cntxtDtls = "in getdeliveryboyslist";
	var QRY_TO_EXEC = `SELECT a.id,a.delivery_boy_name,a.delivery_boy_mobile_number FROM delivery_boy_t AS a WHERE a.d_in = 0 AND delivery_boy_active_status = 0 ORDER BY a.delivery_boy_name DESC;`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.getorderslist = function (data, callback) {
	var cntxtDtls = "in getorderslist";
	var QRY_TO_EXEC = `SELECT a.*, b.category_name,
		DATE_FORMAT(a.order_date_time, '%d-%m-%Y %H:%i:%s') AS orderdate,
		DATE_FORMAT(a.accept_order_date_time, '%d-%m-%Y %H:%i:%s') AS accepteddate,
		DATE_FORMAT(a.deliveryboy_pickup_time, '%d-%m-%Y %H:%i:%s') AS pickupdate,
		DATE_FORMAT(a.order_deliverd_date_time, '%d-%m-%Y %H:%i:%s') AS deliverydate,
		CONCAT(a.customer_name, ' (', a.customer_mobile_number, ')') AS customer_info,
		d.delivery_boy_name, d.delivery_boy_mobile_number,
		u.name AS cancelled_by, s.shop_name AS accepted_shop_name,
		ROUND(a.order_distance, 3) AS order_distance,
		(SELECT COUNT(*) FROM order_lst_t x WHERE x.order_id = a.order_id AND x.d_in = 0) AS split_count,
		(SELECT COUNT(*) FROM order_lst_t x WHERE x.order_id = a.order_id AND x.d_in = 0 AND x.id <= a.id) AS split_no
		FROM order_lst_t AS a
		LEFT JOIN category_tbl AS b ON a.category_id = b.id
		LEFT JOIN delivery_boy_t AS d ON a.delivery_boy_id = d.id
		LEFT JOIN users AS u ON a.status_entry_id = u.id
				LEFT JOIN shop_list_t AS s ON s.id = a.shop_id AND a.shop_id > 0
		WHERE a.d_in = 0 `;

	var params = [];

	if (data.from_date && data.to_date) {
		QRY_TO_EXEC += ` AND DATE(a.order_date_time) BETWEEN ? AND ?`;
		params.push(data.from_date, data.to_date);
	}

	if (data.category_id) {
		QRY_TO_EXEC += ` AND a.category_id = ?`;
		params.push(data.category_id);
	}

	if (data.location_id) {
		QRY_TO_EXEC += ` AND a.location_id = ?`;
		params.push(data.location_id);
	}

	if (data.order_id) {
		QRY_TO_EXEC += ` AND a.order_id = ?`;
		params.push(data.order_id);
	}

	if (params.length === 0) {
		return callback(null, []);
	}

	// keeps all parts of one order together, newest order first
	QRY_TO_EXEC += ` ORDER BY (SELECT MAX(x.id) FROM order_lst_t x WHERE x.order_id = a.order_id) DESC, a.id ASC`;

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updateorderstatus = function (data, callback) {
	var cntxtDtls = "in updateorderstatus";
var QRY_TO_EXEC = `Update order_lst_t set order_status = ? ,order_preparation_time = ?,vendor_reject_remarks = ?,status_entry_id = ?, shop_id = COALESCE(?, shop_id) where id = ?`;
let params = [data.value, data.preparation_time, data.remarks, data.entry_id, data.shop_id || null, data.id]

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getorderdetails = function (data, callback) {
	var cntxtDtls = "in getorderdetails";
	var QRY_TO_EXEC = `SELECT a.* FROM sub_orders_items_t AS a WHERE a.order_id = ? ;`;
	let params = [data.id];
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getcustomerorderdetails = function (data, callback) {
	var cntxtDtls = "in getcustomerorderdetails";
	var QRY_TO_EXEC = `SELECT a.*,b.shop_name FROM sub_orders_items_t as a LEFT JOIN shop_list_t AS b ON a.shop_id = b.id WHERE a.order_id = ? ;`;
	let params = [data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getapplicationdata = function (callback) {
	var cntxtDtls = "in getapplicationdata";
	var QRY_TO_EXEC = `SELECT a.* FROM application_table AS a ;`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.updateapplicationdata = function (data, callback) {
	var cntxtDtls = "in updateapplicationdata";
	var QRY_TO_EXEC = `Update application_table set handling_charges = ?,donation_charges = ?,surcharges = ?,gst_percentage = ?,vendor_commission = ? where id = ?`;
	let params = [data.handling_charges, data.donation_charges, data.surcharges, data.gst_percentage, data.vendor_commission, data.id]

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getdeliverychargesdata = function (callback) {
	var cntxtDtls = "in getdeliverychargesdata";
	var QRY_TO_EXEC = `SELECT a.minimum_km, a.minimum_del_charge, a.per_km_chargers, a.maximum_del_km FROM shop_list_t AS a WHERE a.id != 1 AND d_in = 0 LIMIT 1;`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.updatedeliverychargesdata = function (data, callback) {
	var cntxtDtls = "in updatedeliverychargesdata";
	var QRY_TO_EXEC = `Update shop_list_t set minimum_km = ?,minimum_del_charge = ?,per_km_chargers = ?,maximum_del_km = ? WHERE category_id != 4;`;
	let params = [data.minimum_km, data.minimum_del_charge, data.per_km_chargers, data.maximum_del_km]

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.submitincentiveamount = function (data, callback) {
	var cntxtDtls = "in submitincentiveamount";
	var QRY_TO_EXEC = `UPDATE delivery_boy_t set incentive_amount = ? where id = ? ;`;
	let value = [data.incentive_amount, data.deliveryboy_id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.getshopsforpayments = function (data, callback) {
	var cntxtDtls = "in getshopsforpayments";
	var QRY_TO_EXEC = `SELECT a.id, a.vendor_payment_otp,a.admin_percentage,a.commission_type,SUM(ROUND(CASE a.commission_type WHEN 0 THEN (a.admin_percentage / 100) * b.total_amount WHEN 1 THEN a.admin_percentage ELSE NULL END, 2)) AS admin_service_fee,CONCAT(a.shop_name, ' (', a.shop_phone_number, ')') AS shop_info, a.shop_image, COUNT(b.id) AS total_orders, CONCAT(MIN(b.order_date), ' - ', MAX(b.order_date)) AS date_range, SUM(b.total_amount) AS item_amount,  JSON_ARRAYAGG(b.id) AS order_ids,SUM(b.packing_charges) as packing_charges FROM shop_list_t AS a JOIN order_lst_t AS b ON a.id = b.shop_id WHERE a.d_in = '0' AND b.vendor_payment_status = 0 AND b.order_status = 3 `;

	var params = [];

if (data.filters.shop && data.filters.shop.length) {
	QRY_TO_EXEC += ` AND a.id IN (?)`;
	params.push(data.filters.shop);
}
	if (data.filters.location) {
		QRY_TO_EXEC += ` AND b.location_id = ?`;     // was a.location_id
		params.push(data.filters.location);
	}

	if (data.filters.category) {
		QRY_TO_EXEC += ` AND b.category_id = ?`;     // was a.category_id
		params.push(data.filters.category);
	}

	if (data.filters.fromdate && data.filters.todate) {
		QRY_TO_EXEC += ` AND DATE(b.order_date) BETWEEN ? AND ?`;
		params.push(data.filters.fromdate, data.filters.todate);
	}

	QRY_TO_EXEC += ` GROUP BY a.id, a.shop_name, a.shop_phone_number, a.shop_image ORDER BY a.shop_name `;

	if (params.length === 0) {
		return callback(null, []);
	}


	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.submitpaymentdetails = function (data, callback) {
	var cntxtDtls = "in submitpaymentdetails";
	var createddate = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
	var QRY_TO_EXEC = `INSERT INTO vendor_payment_t (vendor_id,payment_dates ,order_ids,total_orders,item_amount,admin_service_fee,admin_percentage,total_payment_amount,payment_date_time,payment_method,payment_transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
	let value = [data.id, data.date_range, JSON.stringify(data.order_ids), data.total_orders, data.item_amount, data.admin_service_fee, data.admin_percentage, data.total_payment_amount, createddate, data.payment_method, data.payment_transaction_id]
	console.log(QRY_TO_EXEC, value)
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.updatevendorpaymentstatus = function (data, callback) {
	var cntxtDtls = "in updatevendorpaymentstatus";
	var host = Array.isArray(data.order_ids) ? data.order_ids : JSON.parse(data.order_ids);
	var QRY_TO_EXEC = '';
	var MU_QRY_TO_EXEC = '';
	let params = [];
	for (let i = 0; i < host.length; i++) {
		QRY_TO_EXEC = `UPDATE order_lst_t SET vendor_payment_status = ? where id = ? ;`;
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push('1', host[i]);
	}

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatepaymentotp = function (data, callback) {
	var cntxtDtls = "in updatepaymentotp";
	let randomOTP = Math.floor(100000 + Math.random() * 900000);
	var QRY_TO_EXEC = `UPDATE shop_list_t set vendor_payment_otp = ? where id = ? ;`;
	let value = [randomOTP, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, value, cntxtDtls);
};

exports.getpaymenthistory = function (data, callback) {
	var cntxtDtls = "in getpaymenthistory";
	var QRY_TO_EXEC = `SELECT a.*,b.shop_name,b.shop_phone_number,b.location_id,b.category_id,DATE_FORMAT(a.payment_date_time, '%Y-%m-%d %H:%i:%s') AS settlement_date_time FROM vendor_payment_t as a LEFT JOIN shop_list_t as b ON a.vendor_id = b.id WHERE 1=1 `;

	var params = [];

	if (data.filters.fromdate && data.filters.todate) {
		QRY_TO_EXEC += ` AND DATE(a.payment_date_time) BETWEEN ? AND ?`;
		params.push(data.filters.fromdate, data.filters.todate);
	}

	if (data.filters.location) {
		QRY_TO_EXEC += ` AND b.location_id = ?`;
		params.push(data.filters.location);
	}

	if (data.filters.category) {
		QRY_TO_EXEC += ` AND b.category_id = ?`;
		params.push(data.filters.category);
	}

	if (data.filters.shop) {
		QRY_TO_EXEC += ` AND a.vendor_id = ?`;
		params.push(data.filters.shop);
	}

	QRY_TO_EXEC += ` ORDER BY a.id desc`;

	if (params.length === 0) {
		return callback(null, []);
	}

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};


// ************* masters End **********//

// ************* Products Start **********//

exports.getmatchedfilter = function (id, callback) {
	var cntxtDtls = "in getmatchedfilter";
	var QRY_TO_EXEC = `SELECT * FROM main_filter_tbl WHERE category_id = ? AND d_in = 0 ORDER BY main_filter_name ASC;`;
	let params = [id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
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

const COLS = ['category_id', 'category_name', 'sub_category_id', 'sub_category_name', 'item_name',
	'item_description', 'item_image', 'item_images', 'brand', 'unit_type', 'tax_percent', 'attributes', 'filter_one',
	'filter_two', 'prescription_required', 'quantity_type', 'shop_items_tb_nm', 'unique_code', 'sku',
	'barcode', 'stock_qty', 'variant_options', 'quantity_varient', 'actual_price', 'selling_price',
	'discount_percentage', 'discount_amount'];

// const INSERT_SQL = `INSERT INTO z_all_items_t (${COLS.join(',')},i_ts,entry_by)
//   VALUES (${[...COLS, 'i_ts', 'entry_by'].map(() => '?').join(',')})`;
// const UPDATE_SQL = `UPDATE z_all_items_t SET ${COLS.map(c => c + '=?').join(',')} WHERE id = ?`;

const itemTable = name => {
	if (!/^z_[a-z0-9_]+_item_lst_t$/.test(name || '')) throw new Error('Invalid table_name: ' + name);
	return name;
};
const insertSql = t => `INSERT INTO ${itemTable(t)} (${COLS.join(',')},i_ts,entry_by)
  VALUES (${[...COLS, 'i_ts', 'entry_by'].map(() => '?').join(',')})`;
const updateSql = t => `UPDATE ${itemTable(t)} SET ${COLS.map(c => c + '=?').join(',')} WHERE id = ?`;

const nul = v => (v === '' || v === undefined ? null : v);
const json = o => (o && Object.keys(o).length ? JSON.stringify(o) : null);
const makeUniqueCode = name =>
	`${sanitizeItemName(name).substring(0, 10)}-${Math.floor(100000 + Math.random() * 900000)}`;

function rowValues(d, v, image, uc, i) {
	return [
		d.category_id, d.category_name, d.sub_category_id, d.sub_category_name,
	d.item_name, d.item_description,v.item_image || image, v.gallery_json || null, d.brand, nul(d.unit_type), nul(d.tax_percent),
		json(d.attributes), d.filter_one, d.filter_two, d.prescription_required || 0,
		d.quantity_type || 0, d.table_name, uc,
		v.sku || `${uc}-${i + 1}`, v.barcode || null, v.stock_qty || 0,
		json(v.variant_options), v.quantity_varient || null,
		v.actual_price || 0, v.selling_price || 0,
		v.discount_percentage || 0, v.discount_amount || 0
	];
}

const q = (sql, params, ctx) => new Promise((resolve, reject) => {
	sqldb.MySQLConPool.query(sql, params, (err, results) => {
		if (err) {
			console.error('SQL ERROR', ctx, '->', err.code, err.sqlMessage || err.message);
			console.error('PARAMS', JSON.stringify(params));
			return reject(err);
		}
		resolve(results);
	});
});


function normalizeVariants(raw) {
	let v = raw;
	if (typeof v === 'string') {
		try { v = JSON.parse(v); } catch (e) { v = []; }   // multipart/form-data sends it as a string
	}
	if (v && !Array.isArray(v)) v = Object.values(v);     // {0:{...},1:{...}} -> [{...},{...}]
	return Array.isArray(v) ? v : [];
}

exports.additems = async function (data, image) {
	const ts = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
	const uc = makeUniqueCode(data.item_name);
	const variants = normalizeVariants(data.variants);
	console.log('additems variants received:', variants.length);   // temporary debug
	if (!variants.length) throw new Error('No variants received');
	const ids = [];
	for (const [i, v] of variants.entries()) {
		const r = await q(insertSql(data.table_name), [...rowValues(data, v, image, uc, i), ts, data.entry_by], "in additems"); ids.push(r.insertId);
	}
	return { insertId: ids[0], ids, unique_code: uc };
};



exports.additemintosearch = function (insertId, data, imageupload, callback) {
	var cntxtDtls = "in additemintosearch";
	var QRY_TO_EXEC = `INSERT INTO search_type_t (search_key_type,search_text,search_image,search_id,search_table) VALUES (?,?,?,?,?);`;
	let params = ['4', data.item_name, imageupload, insertId, data.table_name]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

// exports.getitems = async function (data, callback) {
// 	try {
// 		const cat = await q(`SELECT shop_items_tb_nm FROM category_tbl WHERE id = ?`, [data.filters.category], "in getitems");
// 		if (!cat.length) return callback(null, []);
// 		let sql = `SELECT * FROM ${itemTable(cat[0].shop_items_tb_nm)} WHERE category_id = ? AND d_in = 0 `;
// 		const params = [data.filters.category];
// 		if (data.filters.subcategory) {
// 			sql += ` AND sub_category_id = ?`;
// 			params.push(data.filters.subcategory);
// 		}
// 		sql += ` ORDER BY id DESC;`;
// 		callback(null, await q(sql, params, "in getitems"));
// 	} catch (err) {
// 		callback(err, null);
// 	}
// };

exports.getitems = async function (data, callback) {
	try {
		const f = data.filters || {};
		let rows = [];

		if (f.category) {
			// one category selected
			const cat = await q(`SELECT shop_items_tb_nm FROM category_tbl WHERE id = ?`, [f.category], "in getitems");
			if (!cat.length) return callback(null, []);
			let sql = `SELECT * FROM ${itemTable(cat[0].shop_items_tb_nm)} WHERE category_id = ? AND d_in = 0 `;
			const params = [f.category];
			if (f.subcategory) {
				sql += ` AND sub_category_id = ?`;
				params.push(f.subcategory);
			}
			sql += ` ORDER BY id DESC;`;
			rows = await q(sql, params, "in getitems");
		} else {
			// no filter -> read every category table and merge
			const cats = await q(`SELECT id, shop_items_tb_nm FROM category_tbl WHERE d_in = 0`, [], "in getitems");
			for (const c of cats) {
				try {
					const part = await q(
						`SELECT * FROM ${itemTable(c.shop_items_tb_nm)} WHERE category_id = ? AND d_in = 0 ORDER BY id DESC;`,
						[c.id], "in getitems");
					rows = rows.concat(part);
				} catch (e) {
					// table missing or invalid name: skip this category, keep the rest
				}
			}
		}

		callback(null, rows);
	} catch (err) {
		callback(err, null);
	}
};

// exports.updateitems = function (data, imageupload, callback) {
// 	var cntxtDtls = "in updateitems";
// 	var QRY_TO_EXEC = `update z_all_items_t set category_id = ?,category_name = ?,sub_category_id = ?,sub_category_name = ?,item_name = ?,item_description = ?,item_image = ?,filter_one = ?,filter_two = ?,actual_price = ?,selling_price = ?,discount_percentage = ?,discount_amount = ?,prescription_required = ? where id = ?;`;
// 	var params = [data.category_id, data.category_name, data.sub_category_id, data.sub_category_name, data.item_name, data.item_description, imageupload, data.filter_one, data.filter_two, data.actual_price || 0, data.selling_price || 0, data.discount_percentage || 0, data.discount_amount || 0, data.prescription_required, data.id]

// 	if (callback && typeof callback == "function") {
// 		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
// 			callback(err, results);
// 			return;
// 		});
// 	}
// 	else
// 		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
// };

exports.updateitems = async function (data, image) {
	const ts = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
	const uc = data.unique_code || makeUniqueCode(data.item_name);
	const t = itemTable(data.table_name);
	for (const [i, v] of normalizeVariants(data.variants).entries()) {
		if (v.ind == 3) await q(`UPDATE ${t} SET d_in = 1 WHERE id = ?`, [v.id], "in updateitems");
		else if (v.ind == 2) await q(insertSql(t), [...rowValues(data, v, image, uc, i), ts, data.entry_by], "in updateitems");
		else await q(updateSql(t), [...rowValues(data, v, image, uc, i), v.id], "in updateitems");
	}
};



exports.deleteitems = async function (data, callback) {
	try {
		const t = itemTable(data.table_name);
		for (const id of data.ids) await q(`UPDATE ${t} SET d_in = 1 WHERE id = ?`, [id], "in deleteitems");
		callback(null, { deleted: data.ids.length });
	} catch (err) {
		callback(err, null);
	}
};

exports.getmatchedshops = function (callback) {
	var cntxtDtls = "in getmatchedshops";
	var QRY_TO_EXEC = `SELECT a.id,a.shop_unique_id, a.shop_name,a.shop_phone_number,a.shop_address,a.location_id,a.category_id,b.shop_items_tb_nm FROM shop_list_t as a LEFT JOIN category_tbl as b ON a.category_id = b.id WHERE a.d_in = 0 ORDER BY shop_name ASC;`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.getmatchedallshops = function (id, callback) {
	var cntxtDtls = "in getmatchedallshops";
	var QRY_TO_EXEC = `SELECT a.id,a.shop_unique_id,a.admin_percentage,a.shop_name,a.shop_address,a.shop_phone_number,a.location_id FROM shop_list_t as a WHERE a.category_id = ? AND a.d_in = 0 ORDER BY shop_name ASC;`;
	let params = [id]

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getmatchedshopitems = function (data, callback) {
	var cntxtDtls = "in getmatchedshopitems";
	var QRY_TO_EXEC = `SELECT a.id,a.item_name FROM ${data.table_name} as a WHERE a.shop_id = ? AND a.d_in = 0 ORDER BY item_name ASC;`;
	let params = [data.shop_id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getitemstoassign = function (data, callback) {
	var cntxtDtls = "in getitemstoassign";
	// 	var QRY_TO_EXEC = `SELECT * FROM z_all_items_t AS a WHERE a.category_id = ? AND a.d_in = 0 AND a.id NOT IN ( SELECT item_id FROM ${data.table_name} WHERE d_in = 0 AND category_id = ? AND shop_id = ?) ORDER BY sub_category_name ASC;`;
	// 	let params = [data.category_id, data.category_id, data.shop_id]

	let QRY_TO_EXEC = `
  SELECT *  FROM z_all_items_t AS a 
  WHERE a.category_id = ? AND a.d_in = 0 AND a.id NOT IN ( SELECT item_id FROM ${data.table_name} WHERE d_in = 0  AND category_id = ?  AND shop_id = ?)`;

	let params = [data.category_id, data.category_id, data.shop_id];

	if (data.subcategory_id) {
		QRY_TO_EXEC += ` AND a.sub_category_id = ? 
                   AND a.id NOT IN (
                       SELECT item_id 
                       FROM ${data.table_name} 
                       WHERE d_in = 0 
                         AND category_id = ? 
                         AND sub_category_id = ? 
                         AND shop_id = ?
                   )`;
		params.push(data.subcategory_id, data.category_id, data.subcategory_id, data.shop_id);
	}

	QRY_TO_EXEC += ` ORDER BY sub_category_name ASC;`;

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.submitassignedproducts = function (data, callback) {
	var cntxtDtls = "in submitassignedproducts";
	var item = data.items
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < item.length; j++) {
		var QRY_TO_EXEC = `INSERT INTO ${data.table_name} (shop_id,item_id,item_name,item_image,item_description,category_id,category_name,sub_category_id,sub_category_name,filter_one,filter_two,actual_price,selling_price,discount_percentage,discount_amount,admin_percentage,quantity_varient,unique_code,location_id,prescription_required,entry_by,active_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(item[j].shop_id, item[j].item_id, item[j].item_name, item[j].item_image, item[j].item_description, item[j].category_id, item[j].category_name, item[j].sub_category_id, item[j].sub_category_name, item[j].filter_one, item[j].filter_two, item[j].actual_price || 0, item[j].selling_price || 0, item[j].discount_percentage || 0, item[j].discount_amount || 0, item[j].admin_percentage, item[j].quantity_varient, item[j].unique_code, item[j].location_id, item[j].prescription_required, item[j].entry_by, 1)
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getshopitems = function (data, callback) {
	var cntxtDtls = "in getshopitems";
	var QRY_TO_EXEC = `SELECT * FROM ${data.table_name} as a WHERE a.shop_id = ? AND a.d_in = 0 ORDER BY id DESC;`;
	let params = [data.shop_id]
	console.log(QRY_TO_EXEC, params)
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updateshopitemsWithouttasks = function (data, imageupload, callback) {
	var cntxtDtls = "in updateshopitemsWithouttasks";
	var QRY_TO_EXEC = `update ${data.table_name} set category_id = ?,category_name = ?,sub_category_id = ?,sub_category_name = ?,item_name = ?,item_description = ?,full_description = ?,item_image = ?,filter_one = ?,filter_two = ?,actual_price = ?,selling_price = ?,discount_percentage = ?,discount_amount = ?,quantity_varient = ?,quantity_type = ?,prescription_required = ?,item_gst = ? where id = ?;`;
	var params = [data.category_id, data.category_name, data.sub_category_id, data.sub_category_name, data.item_name, data.item_description, data.full_description, imageupload, data.filter_one, data.filter_two, data.actual_price, data.selling_price, data.discount_percentage, data.discount_amount, data.quantity_varient, data.quantity_type, data.prescription_required, data.item_gst, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updateshopitemsWithtasks = function (data, imageupload, callback) {
	var cntxtDtls = "in updateshopitemsWithtasks";

	// 	const firstTaskPrice = data?.edittasks?.find(task => task.title == "Quantity");
	// 	const quantityPrice = firstTaskPrice?.price || 0;

	let quantityPrice = 0;
	if (data && data.edittasks && Array.isArray(data.edittasks)) {
		const firstTaskPrice = data.edittasks.find(function (task) {
			return task.title === "Quantity";
		});

		if (firstTaskPrice && firstTaskPrice.price) {
			quantityPrice = firstTaskPrice.price;
		}
	}
	const increasedPrice = Math.round(quantityPrice * 1.3);
	var QRY_TO_EXEC = `UPDATE ${data.table_name} SET category_id = ?, category_name = ?, sub_category_id = ?, sub_category_name = ?,item_name = ?, item_description = ?,full_description = ?, item_image = ?, filter_one = ?,filter_two = ?, quantity_type = ?,prescription_required = ?,item_gst = ?,actual_price = ?,selling_price = ? WHERE id = ?;`;
	var params = [data.category_id, data.category_name, data.sub_category_id, data.sub_category_name,
	data.item_name, data.item_description, data.full_description, imageupload, data.filter_one, data.filter_two, data.quantity_type, data.prescription_required, data.item_gst, data.actual_price, data.selling_price, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updateshopextraitems = function (data, callback) {
	const cntxtDtls = "in updateshopextraitems";
	let fullQuery = '';
	let params = [];

	for (let i = 0; i < data.edittasks.length; i++) {
		let task = data.edittasks[i];

		if (task.ind == 1) {
			fullQuery += `UPDATE shop_extra_items_t SET item_id = ?, category_id = ?,shop_id = ?,title = ?,food_type = ?, user_selection = ?, extra_item_name = ?,price = ?, table_name = ? WHERE id = ? ;`;
			params.push(data.id, data.category_id, data.shop_id, task.title, task.food_type, task.user_selection, task.extra_item_name, task.price, data.table_name, task.id
			);
		} else if (task.ind == 2) {
			fullQuery += `insert into shop_extra_items_t (item_id, category_id, shop_id,title,food_type,user_selection,extra_item_name,price,table_name) values(?,?,?,?,?,?,?,?,?) ;`;
			params.push(
				data.id, data.category_id, data.shop_id, task.title, task.food_type, task.user_selection, task.extra_item_name, task.price, data.table_name
			);
		}
	}

	if (fullQuery === '') {
		return callback('No valid tasks to process', null);
	}

	if (callback && typeof callback === "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, fullQuery, params, cntxtDtls, function (err, results) {
			callback(err, results);
		});
	} else {
		return dbutil.sqlinjection(sqldb.MySQLConPool, fullQuery, params, cntxtDtls);
	}
};

exports.updatedeletedshopitemsintasks = function (data, callback) {
	var cntxtDtls = "in updatedeletedshopitemsintasks";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.deletedItems.length; j++) {
		var QRY_TO_EXEC = `DELETE FROM shop_extra_items_t WHERE id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data.deletedItems[j].id)
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.deleteshopitems = function (data, callback) {
	var cntxtDtls = "in deleteshopitems";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.ids.length; j++) {
		var QRY_TO_EXEC = `Update ${data.table_name} set d_in=1 where id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data.ids[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.addshopitemsinmaintbl = function (data, imageupload, callback) {
	var cntxtDtls = "in addshopitemsinmaintbl";
	var createddate = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");

	var QRY_TO_EXEC = `INSERT INTO z_all_items_t (category_id,category_name,sub_category_id,sub_category_name,item_name,item_description,item_image,filter_one,filter_two,quantity_type,actual_price,selling_price,discount_percentage,discount_amount,unique_code,shop_items_tb_nm,entry_by,i_ts) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
	let params = [data.category_id, data.category_name, data.sub_category_id, data.sub_category_name, data.item_name, data.item_description, imageupload, data.filter_one, data.filter_two, data.quantity_type, 0, 0, 0, 0, data.uniquecode, data.table_name, data.entry_by, createddate]

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

	var QRY_TO_EXEC = `INSERT INTO ${data.table_name} (shop_id,category_id,category_name,sub_category_id,sub_category_name,item_name,item_description,full_description,item_image,filter_one,filter_two,actual_price,selling_price,discount_percentage,discount_amount,admin_percentage,location_id,quantity_type,unique_code,item_gst,entry_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
	let params = [data.shop_id, data.category_id, data.category_name, data.sub_category_id, data.sub_category_name, data.item_name, data.item_description, data.full_description, imageupload, data.filter_one, data.filter_two, data.actual_price, data.selling_price, data.discount_percentage, data.discount_amount, data.admin_percentage, data.location_id, data.quantity_type, uniquecode, data.item_gst, data.entry_by]
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

	var QRY_TO_EXEC = `INSERT INTO ${data.table_name} (shop_id,category_id,category_name,sub_category_id,sub_category_name,item_name,item_description,full_description,item_image,filter_one,filter_two,actual_price,selling_price,admin_percentage,location_id,quantity_type,unique_code,prescription_required,item_gst,entry_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
	let params = [data.shop_id, data.category_id, data.category_name, data.sub_category_id, data.sub_category_name, data.item_name, data.item_description, data.full_description, imageupload, data.filter_one, data.filter_two, data.actual_price, data.selling_price, data.admin_percentage, data.location_id, data.quantity_type, uniquecode, data.prescription_required, data.item_gst, data.entry_by]
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
	var cntxtDtls = "in insertshopextraitems";
	var host = data.tasks;
	var QRY_TO_EXEC = '';
	var MU_QRY_TO_EXEC = '';
	let params = [];
	for (let i = 0; i < host.length; i++) {
		QRY_TO_EXEC = `insert into shop_extra_items_t (item_id, category_id, shop_id,title,food_type,user_selection,extra_item_name,price,table_name) values(?,?,?,?,?,?,?,?,?);`;
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(Insertid, data.category_id, data.shop_id, host[i].title, host[i].food_type, host[i].user_selection, host[i].extra_item_name, host[i].price, data.table_name);
	}

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getextrashopitemsforedit = function (data, callback) {
	var cntxtDtls = "in getextrashopitemsforedit";
	var QRY_TO_EXEC = `SELECT * FROM shop_extra_items_t as a WHERE a.item_id = ? AND a.category_id = ? AND a.d_in = 0 ORDER BY id DESC;`;
	let params = [data.item_id, data.category_id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.gettitle = function (id, callback) {
	var cntxtDtls = "in gettitle";
	var QRY_TO_EXEC = `SELECT * FROM extraitem_title_t WHERE d_in = 0 AND category_id = ? ORDER BY title ASC;`;
	let params = [id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getitemdataforsuggestions = function (data, callback) {
	var cntxtDtls = "in getitemdataforsuggestions";
	var QRY_TO_EXEC = `SELECT * FROM z_all_items_t WHERE item_name LIKE ? AND category_id = ? AND sub_category_id = ? AND filter_one = ? AND d_in = 0 GROUP BY unique_code;`;
	let params = [`%${data.item_name}%`, data.category_id, data.sub_category_id, data.filter_one]

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.exportextrashopitems = function (data, callback) {
	var cntxtDtls = "in exportextrashopitems";
	var QRY_TO_EXEC = `SELECT * FROM shop_extra_items_t as a WHERE a.item_id != ? AND a.category_id = ? AND a.shop_id = ? AND a.d_in = 0 ORDER BY id DESC;`;
	let params = [0, data.category_id, data.shop_id]

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.submitextraitems = function (data, callback) {
	var cntxtDtls = "in submitextraitems";
	var host = data.Extratasks;
	var QRY_TO_EXEC = '';
	var MU_QRY_TO_EXEC = '';
	let params = [];
	for (let i = 0; i < host.length; i++) {
		QRY_TO_EXEC = `insert into shop_extra_items_t (item_id, category_id, shop_id,title,food_type,user_selection,extra_item_name,price,table_name) values(?,?,?,?,?,?,?,?,?);`;
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(0, data.category_id, data.shop_id, host[i].title, host[i].food_type, host[i].user_selection, host[i].extra_item_name, host[i].price, data.table_name);
	}

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getshopcommonextraitems = function (data, callback) {
	var cntxtDtls = "in getshopcommonextraitems";
	var QRY_TO_EXEC = `SELECT * FROM shop_extra_items_t as a WHERE a.shop_id = ? AND a.category_id = ? AND a.item_id = ? AND a.d_in = 0  ORDER BY id DESC;`;
	let params = [data.shop_id, data.category_id, '0']

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.deleteCommonItem = function (data, callback) {
	var cntxtDtls = "in deleteCommonItem";
	var QRY_TO_EXEC = `DELETE FROM shop_extra_items_t WHERE id = ?`;
	let params = [data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.editCommonItem = function (data, callback) {
	var cntxtDtls = "in editCommonItem";
	var QRY_TO_EXEC = `update shop_extra_items_t set title = ?,food_type= ?,user_selection = ?,extra_item_name = ?,price = ? where id = ?;`;
	let params = [data.title, data.food_type, data.user_selection, data.extra_item_name, data.price, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.checkshopcommonextraitems = function (data, callback) {
	var cntxtDtls = "in checkshopcommonextraitems";
	var QRY_TO_EXEC = `Select * from shop_extra_items_t where shop_id = ? AND category_id = ? AND item_id = ?`;
	let params = [data.shop_id, data.category_id, 0]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updateshopcommonitemsind = function (data, callback) {
	var cntxtDtls = "in updateshopcommonitemsind";
	var QRY_TO_EXEC = `update shop_list_t set common_item_ind = ? where id = ?;`;
	let params = [data.common_item_ind, data.shop_id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.submittitle = function (data, callback) {
	var cntxtDtls = "in submittitle";
	var QRY_TO_EXEC = `INSERT INTO extraitem_title_t (category_id,title) VALUES (?,?);`;
	let params = [data.category_id, data.title]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.gettitledata = function (callback) {
	var cntxtDtls = "in gettitledata";
	var QRY_TO_EXEC = `SELECT a.*,c.category_name FROM extraitem_title_t as a LEFT JOIN category_tbl as c ON c.id = a.category_id WHERE a.d_in = 0 ORDER BY a.id DESC;`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.updatetitle = function (data, callback) {
	var cntxtDtls = "in updatetitle";
	var QRY_TO_EXEC = `update extraitem_title_t set category_id = ?, title = ? where id = ?;`;
	var params = [data.category_id, data.title, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.deletetitle = function (data, callback) {
	var cntxtDtls = "in deletetitle";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		var QRY_TO_EXEC = `Update extraitem_title_t set d_in=1 where id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};



// *************** Delivery Boy Incentives Start **************

exports.adddeliveryboysincentivesmdl = function (data, callback) {
	var cntxtDtls = "in adddeliveryboysincentivesmdl";
	var createddate = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
	var QRY_TO_EXEC = `INSERT INTO deliveryboys_incentives (location_id, incentive_range, incentive_amount, i_ts) VALUES (?,?,?,?);`;
	let values = [data.location_id, data.incentive_range, data.incentive_amount, createddate];
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
};

exports.getdeliveryboysincentivesmdl = function (data, callback) {
	var cntxtDtls = "in getdeliveryboysincentivesmdl";
	var QRY_TO_EXEC = `SELECT a.*, l.location_name FROM deliveryboys_incentives as a LEFT JOIN location_tbl as l ON l.id = a.location_id WHERE a.d_in = 0 `;
	var params = [];
	if (data.filters && data.filters.location) {
		QRY_TO_EXEC += ` AND a.location_id = ? `;
		params.push(data.filters.location);
	}
	QRY_TO_EXEC += ` ORDER BY a.incentive_amount ASC `;
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatedeliveryboysincentivesmdl = function (data, callback) {
	var cntxtDtls = "in updatedeliveryboysincentivesmdl";
	var QRY_TO_EXEC = `UPDATE deliveryboys_incentives SET location_id = ?, incentive_range = ?, incentive_amount = ? WHERE id = ?;`;
	let values = [data.location_id, data.incentive_range, data.incentive_amount, data.id];
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, values, cntxtDtls);
};

exports.deletedeliveryboysincentivesmdl = function (data, callback) {
	var cntxtDtls = "in deletedeliveryboysincentivesmdl";
	var MU_QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		MU_QRY_TO_EXEC += `UPDATE deliveryboys_incentives SET d_in = 1 WHERE id = ?;`;
		params.push(data[j]);
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls);
};

// *************** Delivery Boy Incentives End ****************



// ************* Products End **********//

exports.adddevsupport = function (data, imageupload, callback) {
	var cntxtDtls = "in adddevsupport";
	var createddate = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");

	let getLastIdQRY = `SELECT id FROM devsupport ORDER BY id DESC LIMIT 1`;

	dbutil.sqlinjection(sqldb.MySQLConPool, getLastIdQRY, [], cntxtDtls, function (err, rows) {
		if (err) {
			if (callback) callback(err, null);
			return;
		}

		let nextId = (rows.length > 0 ? rows[0].id + 1 : 1);

		let projectCode = '#A';   // e.g. HMS
		let year = moment().format("YYMM");
		let ticketNo = `${projectCode}-${year}${String(nextId).padStart(3, "0")}`;

		let QRY_TO_EXEC = `
            INSERT INTO devsupport 
            (application, issue_title, issue_description, image, show_ind, ticket_type, entry_by, i_ts, ticket_id) 
            VALUES (?,?,?,?,?,?,?,?,?)`;

		let params = [data.application, data.issue_title, data.issue_description, imageupload, data.show_ind, data.ticket_type, data.entry_by, createddate, ticketNo
		];

		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err2, results) {
			if (callback) callback(err2, { ...results, ticket_no: ticketNo });
		});
	});
};

exports.getdevsupport = function (callback) {
	var cntxtDtls = "in getdevsupport";
	var QRY_TO_EXEC = `SELECT a.*, DATE_FORMAT(a.i_ts, '%d-%m-%Y %H:%i:%s') AS issue_date, DATE_FORMAT(a.end_date, '%d-%m-%Y %H:%i:%s') AS enddate, c.name FROM devsupport AS a LEFT JOIN users AS c ON a.entry_by = c.id WHERE a.d_in = 0 ORDER BY a.id DESC`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.updatedevstatus = function (data, callback) {
	var cntxtDtls = "in updatedevstatus";
	var QRY_TO_EXEC = `Update devsupport set dev_status = ? where id = ?`;
	let params = [data.value, data.id]

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updateadminstatus = function (data, callback) {
	var cntxtDtls = "in updateadminstatus";

	// If admin_status = 2 → update end_date also
	let QRY_TO_EXEC, params;
	if (data.value == 2) {
		QRY_TO_EXEC = `UPDATE devsupport 
                       SET admin_status = ?, end_date = NOW() 
                       WHERE id = ?`;
		params = [data.value, data.id];
	} else {
		QRY_TO_EXEC = `UPDATE devsupport 
                       SET admin_status = ? 
                       WHERE id = ?`;
		params = [data.value, data.id];
	}

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	} else {
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
	}
};

function escapeString(value) {
	return value
		.replace(/\\/g, '\\\\')   // Backslash
		.replace(/'/g, "\\'")     // Single quote
		.replace(/"/g, '\\"');    // Double quote
}

exports.updateticketremarks = function (data, callback) {
	var cntxtDtls = "in updateticketremarks";
	var cleanComment = escapeString(data.remarks);
	var QRY_TO_EXEC = `Update devsupport set remarks = ? where id = ?`;
	let params = [cleanComment, data.id]

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.updatetickettype = function (data, callback) {
	var cntxtDtls = "in updatetickettype";
	var QRY_TO_EXEC = `Update devsupport set ticket_type = ? where id = ?`;
	let params = [data.value, data.id]

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

//******************Website  Data******************//

exports.websitecontact = function (data, callback) {
	var cntxtDtls = "in websitecontact";
	var QRY_TO_EXEC = `INSERT INTO contact_data (name,email,phonenumber,subject,message) VALUES ('${data.name}','${data.email}','${data.phn_number}','${data.subject}','${data.mssg}')`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

// exports.sendcontactemail = function (data, callback) {
// 	if (!data.email || !data.phn_number) {
// 		return callback(new Error("Missing required fields"), null);
// 	}

// 	sendcontactEmail(data.email, data.phn_number, data, callback);
// };
// function sendcontactEmail(email, ContactNumber, data, callback) {
// // 	let transporter = nodemailer.createTransport({
// // 		host: "smtpout.secureserver.net",
// // 		port: 465,
// // 		secure: true,
// // 		auth: {
// // 			user: "Support@freshozapcart.com",
// // 			pass: "Babloo@!9515"
// // 		}
// // 	});

// 	let transporter = nodemailer.createTransport({
//     host: "localhost",
//     port: 25,         
//     secure: false,    
//     tls: {
//         rejectUnauthorized: false 
//     }
// 	});

// 	let mailOptions = {
// 		from: 'Support@freshozapcart.com',
// 		to: 'Support@freshozapcart.com',
// 		subject: "Website Contact Data Submittion!",
// 		html: `
//         <meta charset=UTF-8><meta content="width=device-width,initial-scale=1"name=viewport>
//         <style>
//             body {font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;}
//             .container {width: 100%; max-width: 600px; margin: 20px auto; background-color: #fff; padding: 20px;
//                         border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1); text-align: center;}
//             .header {background-color: #007bff; color: #fff; text-align: center; padding: 15px;
//                      border-radius: 8px 8px 0 0; font-size: 22px; font-weight: 700;}
//             .content {padding: 20px; font-size: 16px; color: #333; text-align: left;}
//             .highlight {font-weight: 700;}
//             .footer {text-align: center; font-size: 14px; color: #777; margin-top: 20px;}
//         </style>

//         <div class="container">
//   <div class="content">
//     <p>Dear Fresho Zapcart Admin,</p>
//     <p>My name is <strong style="text-decoration: underline;">${data.name}</strong>.I visited your website and wanted to get in touch with you regarding <strong style="text-decoration: underline;">${data.subject}</strong>.</p>
//     <p>Email: <strong>${data.email}</strong></p>
// 	<p>Contact Number:<strong>${ContactNumber}</strong></p>
// 	<p>Here’s my message:</p>
//     <p><strong style="text-decoration: underline;">${data.mssg}</strong></p>
//     <p>Best regards,<br>
//     ${data.name}</p>
//   </div>
// </div>`
// 	};

// 	transporter.sendMail(mailOptions, (error, info) => {
// 		if (error) {
// 			console.error("Error sending email:", error);
// 			return callback(error, null);
// 		} else {
// 			console.log("Email sent: " + info.response);
// 			return callback(null, { message: "Email sent successfully" });
// 		}

// 	});
// }

exports.merchantdata = function (data, callback) {
	var cntxtDtls = "in merchantdata";
	var QRY_TO_EXEC = `INSERT INTO merchant_form (name,email,phn_number,business,location,Comment) VALUES ('${data.name}','${data.email}','${data.contact_number}','${data.bussiness}','${data.location}','${data.comment}')`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

// exports.sendmercahntemail = function (data, callback) {
// 	if (!data.email || !data.contact_number) {
// 		return callback(new Error("Missing required fields"), null);
// 	}

// 	sendmercahntEmail(data.email, data.contact_number, data, callback);
// };

// function sendmercahntEmail(email, ContactNumber, data, callback) {
// 	let transporter = nodemailer.createTransport({
//     host: "localhost",
//     port: 25,         
//     secure: false,    
//     tls: {
//         rejectUnauthorized: false 
//     }
// 	});

// 	let mailOptions = {
// 		from: 'Support@freshozapcart.com',
// 		to: 'Info@freshozapcart.com',
// 		subject: "Merchant Onboard Data Submittion!",
// 		html: `
//         <meta charset=UTF-8><meta content="width=device-width,initial-scale=1"name=viewport>
//         <style>
//             body {font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;}
//             .container {width: 100%; max-width: 600px; margin: 20px auto; background-color: #fff; padding: 20px;
//                         border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1); text-align: center;}
//             .header {background-color: #007bff; color: #fff; text-align: center; padding: 15px;
//                      border-radius: 8px 8px 0 0; font-size: 22px; font-weight: 700;}
//             .content {padding: 20px; font-size: 16px; color: #333; text-align: left;}
//             .highlight {font-weight: 700;}
//             .footer {text-align: center; font-size: 14px; color: #777; margin-top: 20px;}
//         </style>

//         <div class="container">
//   <div class="content">
//     <p>Dear Fresho Zapcart Admin,</p>

//     <p>My name is <strong style="text-decoration: underline;">${data.name}</strong>, and I am interested in becoming a merchant partner with Fresho Zapcart. I would like to list my business, <strong style="text-decoration: underline;">${data.bussiness}</strong>, located in <strong style="text-decoration: underline;">${data.location}</strong>, on your platform.</p>

//     <p>You can reach me at <strong style="text-decoration: underline;">${data.email}</strong> or call me at <strong style="text-decoration: underline;">${ContactNumber}</strong> for any further communication.</p>

//     <p><strong style="text-decoration: underline;">${data.comment}</strong></p>

//     <p>I look forward to collaborating with your team. Thank you for considering my request.</p>

//     <p style="text-decoration: underline;">Best regards,<br>
//     ${data.name}</p>
//   </div>
// </div>`
// 	};

// 	transporter.sendMail(mailOptions, (error, info) => {
// 		if (error) {
// 			console.error("Error sending email:", error);
// 			return callback(error, null);
// 		} else {
// 			console.log("Email sent: " + info.response);
// 			console.log("Email sent successfully");
// 			return callback(null, { message: "Email sent successfully" });
// 		}

// 	});
// }


exports.carrerdata = function (data, callback) {
	var cntxtDtls = "in carrerdata";
	var QRY_TO_EXEC = `INSERT INTO carrerform (name,email,contact_number,role,experience,location,comment) VALUES ('${data.name}','${data.email}','${data.contact_number}','${data.role}','${data.experience}','${data.location}','${data.comment}')`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.getcarrerdata = function (data, callback) {
	var cntxtDtls = "in getcarrerdata";
	var QRY_TO_EXEC = `Select a.*,DATE_FORMAT(a.i_ts, '%Y-%m-%d %H:%i:%s') AS submission_date FROM carrerform as a where 1=1 `;

	var params = [];
	if (data.from_date && data.to_date) {
		QRY_TO_EXEC += ` AND DATE(a.i_ts) >= ? AND DATE(a.i_ts) <= ? `;
		params.push(data.from_date, data.to_date);
	}

	QRY_TO_EXEC += ` ORDER BY a.id DESC`;

	if (params.length === 0) {
		return callback(null, []);
	}

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getmerchantdata = function (data, callback) {
	var cntxtDtls = "in getmerchantdata";
	var QRY_TO_EXEC = `Select a.*,DATE_FORMAT(a.i_ts, '%Y-%m-%d %H:%i:%s') AS submission_date FROM merchant_form as a where 1=1 `;

	var params = [];
	if (data.from_date && data.to_date) {
		QRY_TO_EXEC += ` AND DATE(a.i_ts) >= ? AND DATE(a.i_ts) <= ?`;
		params.push(data.from_date, data.to_date);
	}

	QRY_TO_EXEC += ` ORDER BY a.id DESC`;

	if (params.length === 0) {
		return callback(null, []);
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getusercontactdata = function (data, callback) {
	var cntxtDtls = "in getusercontactdata";
	var QRY_TO_EXEC = `Select a.*,DATE_FORMAT(a.i_ts, '%Y-%m-%d %H:%i:%s') AS submission_date FROM contact_data as a where 1=1 `;

	var params = [];
	if (data.from_date && data.to_date) {
		QRY_TO_EXEC += ` AND DATE(a.i_ts) >= ? AND DATE(a.i_ts) <= ?`;
		params.push(data.from_date, data.to_date);
	}

	QRY_TO_EXEC += ` ORDER BY a.id DESC`;

	if (params.length === 0) {
		return callback(null, []);
	}

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getvendorsupport = function (data, callback) {
	var cntxtDtls = "in getvendorsupport";
	var QRY_TO_EXEC = `Select a.*,DATE_FORMAT(a.i_ts, '%Y-%m-%d %H:%i:%s') AS submission_date FROM support as a where 1=1 `;

	var params = [];
	if (data.from_date && data.to_date) {
		QRY_TO_EXEC += ` AND DATE(a.i_ts) >= ? AND DATE(a.i_ts) <= ?`;
		params.push(data.from_date, data.to_date);
	}

	QRY_TO_EXEC += ` ORDER BY a.id DESC`;

	if (params.length === 0) {
		return callback(null, []);
	}

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getpublicsupport = function (data, callback) {
	var cntxtDtls = "in getpublicsupport";
	var QRY_TO_EXEC = `Select a.*,DATE_FORMAT(a.i_ts, '%Y-%m-%d %H:%i:%s') AS submission_date FROM customer_complaints_t as a where 1=1 `;

	var params = [];
	if (data.from_date && data.to_date) {
		QRY_TO_EXEC += ` AND DATE(a.i_ts) >= ? AND DATE(a.i_ts) <= ?`;
		params.push(data.from_date, data.to_date);
	}

	QRY_TO_EXEC += ` ORDER BY a.id DESC`;

	if (params.length === 0) {
		return callback(null, []);
	}

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

function escapeString(value) {
	return value
		.replace(/\\/g, '\\\\')   // Backslash
		.replace(/'/g, "\\'")     // Single quote
		.replace(/"/g, '\\"');    // Double quote
}

exports.updatecustomeradmincomment = function (data, callback) {
	var cntxtDtls = "in updatecustomeradmincomment";
	var cleanComment = escapeString(data.admin_comment);
	var QRY_TO_EXEC = `UPDATE customer_complaints_t SET admin_comment = '${cleanComment}' WHERE id = '${data.id}'`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.updatevendoradmincomment = function (data, callback) {
	var cntxtDtls = "in updatevendoradmincomment";
	var cleanComment = escapeString(data.admin_comment);
	var QRY_TO_EXEC = `UPDATE support SET admin_comment = '${cleanComment}' WHERE id = '${data.id}'`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};


//******************Website Data******************//


//****************** Reports ******************//

exports.getsmscount = function (callback) {
	var cntxtDtls = "in getsmscount";
	var QRY_TO_EXEC = `SELECT a.* FROM sms_count_t AS a ;`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.getordercount = function (data, callback) {
	var cntxtDtls = "in getordercount";
	const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

	var QRY_TO_EXEC = `SELECT COUNT(*) AS total_orders,COUNT(CASE WHEN order_status = 3 THEN 1 END) AS completed_orders,COUNT(CASE WHEN order_status IN (0,1,2,8) THEN 1 END) AS pending_orders, COUNT(CASE WHEN order_status = 5 THEN 1 END) AS rejected_orders FROM order_lst_t WHERE d_in = 0 AND order_status != 7 `;

	if (data.selectedValue === 'today') {
		QRY_TO_EXEC += ` AND DATE(order_date) = '${today}' `;
	}

	if (data.selectedValue === 'custom' && data.fromDate && data.toDate) {
		QRY_TO_EXEC += ` AND order_date BETWEEN '${data.fromDate}' AND '${data.toDate}' ;`;
	}
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.getadmindashboardcount = function (data, callback) {
	var cntxtDtls = "in getadmindashboardcount";
	const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

	var QRY_TO_EXEC = `SELECT 
  COUNT(DISTINCT l.id) AS total_locations,
  COUNT(DISTINCT f.id) AS total_franchise,
  COUNT(DISTINCT s.id) AS total_shops,
  COUNT(DISTINCT o.id) AS total_orders 
FROM location_tbl AS l
LEFT JOIN franchise_t AS f 
  ON f.location_id = l.id AND f.d_in = 0 
LEFT JOIN shop_list_t AS s 
  ON s.location_id = l.id AND s.d_in = 0 
LEFT JOIN order_lst_t AS o 
  ON o.shop_id = s.id AND o.order_status NOT IN (7)
WHERE l.d_in = 0 `;

	//   if (data.selectedValue === 'today') {
	//     QRY_TO_EXEC += ` AND DATE(order_date) = '${today}' `;
	// }

	//     if (data.selectedValue === 'custom' && data.fromDate && data.toDate) {
	//         QRY_TO_EXEC += ` AND order_date BETWEEN '${data.fromDate}' AND '${data.toDate}' ;`;
	//     }
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.getorderspiechart = function (data, callback) {
	var cntxtDtls = "in getorderspiechart";
	var QRY_TO_EXEC = `SELECT 
    a.category_id,
    c.category_name,
    COUNT(a.id) AS total_orders,  ROUND((COUNT(a.id) * 100.0 / SUM(COUNT(a.id)) OVER())) AS percentage_share FROM order_lst_t AS a LEFT JOIN category_tbl AS c ON c.id = a.category_id WHERE a.order_status NOT IN (7,4) AND a.d_in = 0 AND c.d_in = 0 GROUP BY a.category_id;
`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.getcategoryorderschart = function (data, callback) {
	var cntxtDtls = "in getcategoryorderschart";
	const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

	var QRY_TO_EXEC = `
        SELECT 
            c.category_name, 
            COUNT(CASE WHEN o.order_status = 3 THEN 1 END) AS completed,
            COUNT(CASE WHEN o.order_status IN (0,1,2,8) THEN 1 END) AS pending,
            COUNT(CASE WHEN o.order_status = 5 THEN 1 END) AS rejected
        FROM order_lst_t o
        JOIN category_tbl c ON o.category_id = c.id
        WHERE c.d_in = 0 AND o.d_in = 0
    `;

	if (data.selectedValue === 'today') {
		QRY_TO_EXEC += ` AND DATE(o.order_date) = '${today}' `;
	}

	if (data.selectedValue === 'custom' && data.fromDate && data.toDate) {
		QRY_TO_EXEC += ` AND o.order_date BETWEEN '${data.fromDate}' AND '${data.toDate}' `;
	}

	// Add group by
	QRY_TO_EXEC += ` GROUP BY c.id ORDER BY c.id;`;

	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.getlocationorderspiechart = function (data, callback) {
	var cntxtDtls = "in getlocationorderspiechart";
	var QRY_TO_EXEC = `SELECT 
    a.location_id,
    l.location_name,
    COUNT(a.id) AS total_orders,  ROUND((COUNT(a.id) * 100.0 / SUM(COUNT(a.id)) OVER())) AS percentage_share FROM order_lst_t AS a LEFT JOIN location_tbl AS l ON l.id = a.location_id WHERE a.order_status NOT IN (7,4) AND a.d_in = 0 AND l.d_in = 0 GROUP BY a.location_id;`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.getvendorperformancechart = function (data, callback) {
	var cntxtDtls = "in getvendorperformancechart";

	let categoryCondition = "";
	let locationCondition = "";

	if (data.category_id && data.category_id !== "") {
		categoryCondition = `AND o.category_id = ${data.category_id}`;
	}

	if (data.location_id && data.location_id !== "") {
		locationCondition = `AND o.location_id = ${data.location_id}`;
	}

	var QRY_TO_EXEC = ` SELECT a.id, a.shop_name, COUNT(o.id) AS total_orders,COUNT(CASE WHEN o.order_status = 3 THEN 1 END) AS completed_orders, COUNT(CASE WHEN o.order_status = 5 THEN 1 END) AS rejected_orders FROM shop_list_t AS a LEFT JOIN order_lst_t AS o ON o.shop_id = a.id AND o.d_in = 0 WHERE a.d_in = 0 AND o.d_in = 0 AND o.order_status IN (3,5) ${locationCondition}  GROUP BY a.id, a.shop_name;`;

	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.getriderperformancechart = function (data, callback) {
	var cntxtDtls = "in getriderperformancechart";
	const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

	var QRY_TO_EXEC = `SELECT d.delivery_boy_name,COUNT(o.id) as total_orders FROM delivery_boy_t as d LEFT JOIN order_lst_t as o ON o.delivery_boy_id = d.id WHERE d.d_in = 0 AND o.d_in = 0 AND order_status = 3 `;

	if (data.selectedValue === 'today') {
		QRY_TO_EXEC += ` AND DATE(o.order_deliverd_date_time) = '${today}' `;
	}

	if (data.selectedValue === 'custom' && data.fromDate && data.toDate) {
		QRY_TO_EXEC += ` AND o.order_deliverd_date_time BETWEEN '${data.fromDate}' AND '${data.toDate}' `;
	}

	QRY_TO_EXEC += ` GROUP BY d.id ORDER BY total_orders desc;`;

	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.getordersannualchart = function (callback) {
	var cntxtDtls = "in getordersannualchart";
	// 	var QRY_TO_EXEC = `SELECT 
	//     m.month_name,
	//     COALESCE(SUM(CASE WHEN o.order_status = 3 THEN 1 END), 0) AS completed,
	//     COALESCE(SUM(CASE WHEN o.order_status IN (0,1,2,8) THEN 1 END), 0) AS pending,
	//     COALESCE(SUM(CASE WHEN o.order_status = 5 THEN 1 END), 0) AS rejected
	// FROM (
	//     SELECT 1 AS month_num, 'Jan' AS month_name UNION ALL
	//     SELECT 2, 'Feb' UNION ALL
	//     SELECT 3, 'Mar' UNION ALL
	//     SELECT 4, 'Apr' UNION ALL
	//     SELECT 5, 'May' UNION ALL
	//     SELECT 6, 'Jun' UNION ALL
	//     SELECT 7, 'Jul' UNION ALL
	//     SELECT 8, 'Aug' UNION ALL
	//     SELECT 9, 'Sep' UNION ALL
	//     SELECT 10, 'Oct' UNION ALL
	//     SELECT 11, 'Nov' UNION ALL
	//     SELECT 12, 'Dec'
	// ) AS m
	// LEFT JOIN order_lst_t o 
	//     ON MONTH(o.order_date_time) = m.month_num 
	//     AND YEAR(o.order_date_time) = YEAR(CURDATE()) 
	//     AND o.d_in = 0
	// GROUP BY m.month_num, m.month_name
	// ORDER BY m.month_num;`;

	var QRY_TO_EXEC = `SELECT 
    m.month_name,
     COALESCE(SUM(CASE WHEN o.order_status NOT IN (7) THEN 1 END), 0) AS total
FROM (
    SELECT 1 AS month_num, 'Jan' AS month_name UNION ALL
    SELECT 2, 'Feb' UNION ALL
    SELECT 3, 'Mar' UNION ALL
    SELECT 4, 'Apr' UNION ALL
    SELECT 5, 'May' UNION ALL
    SELECT 6, 'Jun' UNION ALL
    SELECT 7, 'Jul' UNION ALL
    SELECT 8, 'Aug' UNION ALL
    SELECT 9, 'Sep' UNION ALL
    SELECT 10, 'Oct' UNION ALL
    SELECT 11, 'Nov' UNION ALL
    SELECT 12, 'Dec'
) AS m
LEFT JOIN order_lst_t o 
    ON MONTH(o.order_date_time) = m.month_num 
    AND YEAR(o.order_date_time) = YEAR(CURDATE()) 
    AND o.d_in = 0
GROUP BY 
    m.month_num, m.month_name
ORDER BY 
    m.month_num;`;

	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.getfranchiserevenuelist = function (callback) {
	var cntxtDtls = "in getfranchiserevenuelist";
	var QRY_TO_EXEC = `SELECT 
    f.id AS franchise_id,
    f.franchise_name,
    f.franchise_mobile_number,
    f.location_id,
    COALESCE(s.total_shops, 0) AS total_shops,
    GROUP_CONCAT(DISTINCT l.location_name ORDER BY FIND_IN_SET(l.id, f.location_id) SEPARATOR ', ') AS location_names,
    COALESCE(o.total_orders, 0) AS total_orders
FROM 
    franchise_t AS f
LEFT JOIN (
    SELECT f_sub.id AS franchise_id, COUNT(s.id) AS total_shops
    FROM franchise_t AS f_sub
    LEFT JOIN shop_list_t AS s
        ON FIND_IN_SET(s.location_id, f_sub.location_id) AND s.d_in = 0
    WHERE f_sub.d_in = 0
    GROUP BY f_sub.id
) AS s
ON s.franchise_id = f.id
LEFT JOIN location_tbl AS l
    ON FIND_IN_SET(l.id, f.location_id)
LEFT JOIN (
    SELECT f_sub.id AS franchise_id, SUM(o_count) AS total_orders
    FROM franchise_t AS f_sub
    LEFT JOIN (
        SELECT location_id, COUNT(id) AS o_count
        FROM order_lst_t
        WHERE order_status NOT IN (7)
        GROUP BY location_id
    ) AS o
    ON FIND_IN_SET(o.location_id, f_sub.location_id)
    WHERE f_sub.d_in = 0
    GROUP BY f_sub.id
) AS o
ON o.franchise_id = f.id
WHERE f.d_in = 0
GROUP BY f.id, f.franchise_name, f.franchise_mobile_number, f.location_id;`;

	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.getriderrevenuelist = function (callback) {
	var cntxtDtls = "in getriderrevenuelist";
	var QRY_TO_EXEC = `SELECT 
    f.id AS franchise_id,
    f.franchise_name,
    f.franchise_mobile_number,
    f.location_id,
    COALESCE(s.total_shops, 0) AS total_shops,
    GROUP_CONCAT(DISTINCT l.location_name ORDER BY FIND_IN_SET(l.id, f.location_id) SEPARATOR ', ') AS location_names,
    COALESCE(o.total_orders, 0) AS total_orders
FROM 
    franchise_t AS f
LEFT JOIN (
    SELECT f_sub.id AS franchise_id, COUNT(s.id) AS total_shops
    FROM franchise_t AS f_sub
    LEFT JOIN shop_list_t AS s
        ON FIND_IN_SET(s.location_id, f_sub.location_id) AND s.d_in = 0
    WHERE f_sub.d_in = 0
    GROUP BY f_sub.id
) AS s
ON s.franchise_id = f.id
LEFT JOIN location_tbl AS l
    ON FIND_IN_SET(l.id, f.location_id)
LEFT JOIN (
    SELECT f_sub.id AS franchise_id, SUM(o_count) AS total_orders
    FROM franchise_t AS f_sub
    LEFT JOIN (
        SELECT location_id, COUNT(id) AS o_count
        FROM order_lst_t
        WHERE order_status NOT IN (7)
        GROUP BY location_id
    ) AS o
    ON FIND_IN_SET(o.location_id, f_sub.location_id)
    WHERE f_sub.d_in = 0
    GROUP BY f_sub.id
) AS o
ON o.franchise_id = f.id
WHERE f.d_in = 0
GROUP BY f.id, f.franchise_name, f.franchise_mobile_number, f.location_id;`;

	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.getfranchisedashboardcount = function (data, callback) {
	var cntxtDtls = "in getfranchisedashboardcount";
	const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

	var QRY_TO_EXEC = `SELECT COUNT(*) AS total_orders,
ROUND(SUM(grand_total), 2) AS totalorders_amount,

COUNT(CASE WHEN order_status = 3 THEN 1 END) AS completed_orders,
COUNT(CASE WHEN order_status IN (0,1,2,8) THEN 1 END) AS pending_orders, 
COUNT(CASE WHEN order_status = 5 THEN 1 END) AS rejected_orders, 
ROUND(SUM(CASE WHEN order_status IN (3) THEN grand_total ELSE 0 END), 2) AS completedorders_amount,
ROUND(SUM(CASE WHEN order_status IN (0,1,2,8) THEN grand_total ELSE 0 END), 2) AS pendingorders_amount,
ROUND(SUM(CASE WHEN order_status IN (5) THEN grand_total ELSE 0 END), 2) AS rejectedorders_amount ,

COUNT(CASE WHEN payment_type = 'Cash on Delivery' AND order_status IN (3) THEN 1 END) AS cod_orders,
ROUND(SUM(CASE WHEN payment_type = 'Cash on Delivery' AND order_status IN (3) THEN grand_total ELSE 0 END), 2) AS cod_amount,
COUNT(CASE WHEN payment_type = 'Pay Online' AND order_status IN (3) THEN 1 END) AS online_orders,
ROUND(SUM(CASE WHEN payment_type = 'Pay Online' AND order_status IN (3) THEN grand_total ELSE 0 END), 2) AS online_amount,

ROUND(SUM(CASE WHEN order_status IN (3) THEN (total_amount * admin_percentage / 100) ELSE 0 END), 2) AS admin_commission,
ROUND(SUM(CASE WHEN order_status IN (3) THEN total_item_gst_amount ELSE 0 END), 2) AS itemgst,
ROUND(SUM(CASE WHEN order_status IN (3) THEN delivery_charges ELSE 0 END), 2) AS deliverycharges,
ROUND(SUM(CASE WHEN order_status IN (3) THEN delivery_fixed_charges ELSE 0 END), 2) AS deliveryfixedcharges,
ROUND(SUM(CASE WHEN order_status IN (3) THEN deliveryboy_delivery_charges ELSE 0 END), 2) AS deliveryboydeliverycharges,
ROUND(SUM(CASE WHEN order_status IN (3) THEN delivery_charges_gst ELSE 0 END), 2) AS deliverychargesgst,
ROUND(SUM(CASE WHEN order_status IN (3) THEN handling_charges ELSE 0 END), 2) AS platformcharges,
ROUND(SUM(CASE WHEN order_status IN (3) THEN gstonplatform_fee ELSE 0 END), 2) AS platformchargesgst,
ROUND(SUM(CASE WHEN order_status IN (3) THEN coupon_amount ELSE 0 END), 2) AS coupon_amount,
ROUND(SUM(CASE WHEN order_status IN (3) THEN surcharges ELSE 0 END), 2) AS surcharges,
ROUND(SUM(CASE WHEN order_status IN (3) THEN donation_charges ELSE 0 END), 2) AS donation_charges,
ROUND(SUM(CASE WHEN order_status IN (3) THEN razorpay_charges ELSE 0 END), 2) AS razorpay_charges,
ROUND(SUM(CASE WHEN order_status IN (3) THEN razorpay_gst ELSE 0 END), 2) AS razorpay_gst

FROM order_lst_t WHERE d_in = 0 AND order_status != 7 `;

	if (data.location_id && data.location_id.length > 0) {
		QRY_TO_EXEC += ` AND location_id IN (${data.location_id.join(',')}) `;
	}

	if (data.selectedValue === 'today') {
		QRY_TO_EXEC += ` AND DATE(order_date) = '${today}' `;
	}

	if (data.selectedValue === 'custom' && data.fromDate && data.toDate) {
		QRY_TO_EXEC += ` AND order_date BETWEEN '${data.fromDate}' AND '${data.toDate}' ;`;
	}

	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.getadminfinancialbreakdown = function (data, callback) {
	var cntxtDtls = "in getadminfinancialbreakdown";
	const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

	var QRY_TO_EXEC = `SELECT COUNT(*) AS total_orders,
ROUND(SUM(grand_total), 2) AS totalorders_amount,

COUNT(CASE WHEN order_status = 3 THEN 1 END) AS completed_orders,
COUNT(CASE WHEN order_status IN (0,1,2,8) THEN 1 END) AS pending_orders, 
COUNT(CASE WHEN order_status = 5 THEN 1 END) AS rejected_orders, 
ROUND(SUM(CASE WHEN order_status IN (3) THEN grand_total ELSE 0 END), 2) AS completedorders_amount,
ROUND(SUM(CASE WHEN order_status IN (0,1,2,8) THEN grand_total ELSE 0 END), 2) AS pendingorders_amount,
ROUND(SUM(CASE WHEN order_status IN (5) THEN grand_total ELSE 0 END), 2) AS rejectedorders_amount ,

COUNT(CASE WHEN payment_type = 'Cash on Delivery' AND order_status IN (3) THEN 1 END) AS cod_orders,
ROUND(SUM(CASE WHEN payment_type = 'Cash on Delivery' AND order_status IN (3) THEN grand_total ELSE 0 END), 2) AS cod_amount,
COUNT(CASE WHEN payment_type = 'Pay Online' AND order_status IN (3) THEN 1 END) AS online_orders,
ROUND(SUM(CASE WHEN payment_type = 'Pay Online' AND order_status IN (3) THEN grand_total ELSE 0 END), 2) AS online_amount,

ROUND(SUM(CASE WHEN order_status IN (3) THEN (total_amount * admin_percentage / 100) ELSE 0 END), 2) AS admin_commission,
ROUND(SUM(CASE WHEN order_status IN (3) THEN total_item_gst_amount ELSE 0 END), 2) AS itemgst,
ROUND(SUM(CASE WHEN order_status IN (3) THEN delivery_charges ELSE 0 END), 2) AS deliverycharges,
ROUND(SUM(CASE WHEN order_status IN (3) THEN delivery_fixed_charges ELSE 0 END), 2) AS deliveryfixedcharges,
ROUND(SUM(CASE WHEN order_status IN (3) THEN deliveryboy_delivery_charges ELSE 0 END), 2) AS deliveryboydeliverycharges,
ROUND(SUM(CASE WHEN order_status IN (3) THEN delivery_charges_gst ELSE 0 END), 2) AS deliverychargesgst,
ROUND(SUM(CASE WHEN order_status IN (3) THEN handling_charges ELSE 0 END), 2) AS platformcharges,
ROUND(SUM(CASE WHEN order_status IN (3) THEN gstonplatform_fee ELSE 0 END), 2) AS platformchargesgst,
ROUND(SUM(CASE WHEN order_status IN (3) THEN coupon_amount ELSE 0 END), 2) AS coupon_amount,
ROUND(SUM(CASE WHEN order_status IN (3) THEN surcharges ELSE 0 END), 2) AS surcharges,
ROUND(SUM(CASE WHEN order_status IN (3) THEN donation_charges ELSE 0 END), 2) AS donation_charges,
ROUND(SUM(CASE WHEN order_status IN (3) THEN razorpay_charges ELSE 0 END), 2) AS razorpay_charges,
ROUND(SUM(CASE WHEN order_status IN (3) THEN razorpay_gst ELSE 0 END), 2) AS razorpay_gst,
ROUND(SUM(CASE WHEN order_status IN (3) THEN packing_charges ELSE 0 END), 2) AS packing_charges,
ROUND(SUM(CASE WHEN order_status IN (3) THEN packing_charges_gst  ELSE 0 END), 2) AS packing_charges_gst

FROM order_lst_t WHERE d_in = 0 AND order_status != 7 `;

	if (data.location_id && data.location_id.length > 0) {
		QRY_TO_EXEC += ` AND location_id = '${data.location_id}' `;
	}

	if (data.selectedValue === 'today') {
		QRY_TO_EXEC += ` AND DATE(order_date) = '${today}' `;
	}

	if (data.selectedValue === 'custom' && data.fromDate && data.toDate) {
		QRY_TO_EXEC += ` AND order_date BETWEEN '${data.fromDate}' AND '${data.toDate}' ;`;
	}

	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

//****************** Reports ******************//

//****************** website ******************//

exports.franchisepartnerrequest = function (data, callback) {
	var cntxtDtls = "in franchisepartnerrequest";
	var currentdate = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");

	var QRY_TO_EXEC = `INSERT INTO w_franchise_partner_t
    (name, phone, email, mandal_city, location, pincode, district, state, description,i_ts)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;

	var params = [data.name,
	data.phone,
	data.email,
	data.mandal_city,
	data.location,
	data.pincode,
	data.district,
	data.state,
	data.description, currentdate];

	// 	if (params.length === 0) {
	// 		return callback(null, []);
	// 	}

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.confirmPartnershiprequest = function (data, callback) {
	var cntxtDtls = "in confirmPartnershiprequest";
	var currentdate = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");

	var QRY_TO_EXEC = `INSERT INTO w_partnership_request_t
    (name, phone, email, meeting_date, persons, meeting_time, i_ts)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

	var params = [data.name,
	data.phone,
	data.email,
	data.date,
	data.persons,
	data.time, currentdate];

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.shopregistrationrequest = function (data, callback) {
	var cntxtDtls = "in shopregistrationrequest";
	var currentdate = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");

	var QRY_TO_EXEC = `INSERT INTO w_shoprequest_t
    (shop_name, owner_name, phone, email, location, pincode, district, state,i_ts)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`;

	var params = [data.shop_name,
	data.owner_name,
	data.phone,
	data.email,
	data.location,
	data.pincode,
	data.district,
	data.state, currentdate];

	// 	if (params.length === 0) {
	// 		return callback(null, []);
	// 	}

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.contactInquiry = function (data, callback) {
	var cntxtDtls = "in contactInquiry";
	var currentdate = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");

	var QRY_TO_EXEC = `INSERT INTO w_contact_inquiry_t
    (name, phone, email, services_area, district, state, description,i_ts)
    VALUES (?, ?, ?, ?, ?, ?, ?,?)`;

	var params = [data.name,
	data.phone,
	data.email,
	data.services_area,
	data.district,
	data.state,
	data.description, currentdate];

	// 	if (params.length === 0) {
	// 		return callback(null, []);
	// 	}

	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};


exports.getFranchiseRequests = function (callback) {
	var cntxtDtls = "in getFranchiseRequests";

	var QRY_TO_EXEC = `
        SELECT 
            *, DATE_FORMAT(i_ts, '%Y-%m-%d %H:%i:%s') AS submission_date
        FROM w_franchise_partner_t
        ORDER BY id DESC
    `;

	dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, [], cntxtDtls, callback);
};

exports.getPartnershipRequests = function (callback) {
	var cntxtDtls = "in getPartnershipRequests";

	var QRY_TO_EXEC = `
        SELECT 
            *,  DATE_FORMAT(i_ts, '%Y-%m-%d %H:%i:%s') AS submission_date
        FROM w_partnership_request_t
        ORDER BY id DESC
    `;

	dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, [], cntxtDtls, callback);
};

exports.getShopRequests = function (callback) {
	var cntxtDtls = "in getShopRequests";

	var QRY_TO_EXEC = `
        SELECT 
            *, DATE_FORMAT(i_ts, '%Y-%m-%d %H:%i:%s') AS submission_date
        FROM w_shoprequest_t
        ORDER BY id DESC
    `;

	dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, [], cntxtDtls, callback);
};

exports.getContactInquiries = function (callback) {
	var cntxtDtls = "in getContactInquiries";

	var QRY_TO_EXEC = `
        SELECT 
            *, DATE_FORMAT(i_ts, '%Y-%m-%d %H:%i:%s') AS submission_date
        FROM w_contact_inquiry_t
        ORDER BY id DESC
    `;

	dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, [], cntxtDtls, callback);
};


exports.addmeasurement = function (data, callback) {
	var cntxtDtls = "in addmeasurement";
	// const removeLeadingZeros = (str) => { return str.replace(/([A-Za-z]*)(0*)(\d+)/, '$1$3'); };
	// let rack_code = `${removeLeadingZeros(data.racks_name)}-${removeLeadingZeros(data.sub_rack_name)}-${removeLeadingZeros(data.shelf_name)}-${removeLeadingZeros(data.shelf_location_name)}`;
	var QRY_TO_EXEC = `INSERT INTO measurements_tbl (measurements) VALUES (?)`;
	let params = [data.measurements]
	console.log(44, QRY_TO_EXEC, params);
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;


		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};


exports.submitmeasurement = function (data, callback) {
	var cntxtDtls = "in submitmeasurement";
	var QRY_TO_EXEC = `INSERT INTO measurements_tbl (measurements) VALUES (?);`;
	let params = [data.measurements]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.getmeasurements = function (callback) {
	var cntxtDtls = "in getmeasurements";
	var QRY_TO_EXEC = `SELECT * FROM measurements_tbl WHERE d_in = 0 ORDER BY id DESC;`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};

exports.updatemeasurements = function (data, callback) {
	var cntxtDtls = "in updatemeasurements";
	var QRY_TO_EXEC = `update measurements_tbl set measurements = ? where id = ?;`;
	var params = [data.measurements, data.id]
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};

exports.deletemeasurements = function (data, callback) {
	var cntxtDtls = "in deletemeasurements";
	var MU_QRY_TO_EXEC = '';
	var QRY_TO_EXEC = '';
	var params = [];
	for (var j = 0; j < data.length; j++) {
		var QRY_TO_EXEC = `Update measurements_tbl set d_in=1 where id = ?;`
		MU_QRY_TO_EXEC = MU_QRY_TO_EXEC + QRY_TO_EXEC;
		params.push(data[j])
	}
	if (callback && typeof callback == "function") {
		dbutil.sqlinjection(sqldb.MySQLConPool, MU_QRY_TO_EXEC, params, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.sqlinjection(sqldb.MySQLConPool, QRY_TO_EXEC, params, cntxtDtls);
};


exports.getmeasurement = function (callback) {
	var cntxtDtls = "in getmeasurement";
	var QRY_TO_EXEC = `SELECT a.* FROM measurements_tbl as a WHERE a.d_in = 0 ORDER BY a.id DESC;`;
	if (callback && typeof callback == "function") {
		dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
			callback(err, results);
			return;
		});
	}
	else
		return dbutil.execQuery(sqldb.MySQLConPool, QRY_TO_EXEC, cntxtDtls);
};














