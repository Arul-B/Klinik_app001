const mysql = require('mysql')
const client = require('../public/mqqt_module')
let logo = './public/images/logopama.png'
let ttd = './public/images/ttd.png'
const PDFDocument = require('pdfkit')
const hash = require('bcrypt')

function time(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    let time = yyyy+"-"+mm+"-"+dd
    return time
}
function daysInMonth (month, year) {
    return new Date(year, month, 0).getDate();
}
var date = new Date();
var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
var lastDay = new Date(date.getFullYear(), date.getMonth(), daysInMonth(date.getMonth()+1, date.getFullYear()));
// Connection Pool
let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

// View Users
module.exports = {
    login: async (req,res) => {
        try {
            const alertMessage = req.flash('alertMessage')
            const alertStatus = req.flash('alertStatus')
            const alert = {message : alertMessage, status: alertStatus}
            res.render('index',{
                alert,
                title: "Klinik App | Login"
            })
        } catch (error) {
            req.flash('alertMessage', `$error.message`)
            req.flash('alertStatus','danger')
            res.redirect('/admin/login')
        }
    },
    signin: async (req, res) => {
        try {
            const { username, password } = req.body
            connection.query('SELECT * FROM users WHERE email = ?', [username], async function(err, rows) {
                if(err) throw err
                 
                // if user not found
                if (rows.length <= 0) {
                    req.flash('alertMessage', 'Please correct enter email and Password!')
                    req.flash('alertStatus','danger')
                    res.redirect('/admin/login')
                }
                else { // if user found
                    
                    if(rows.length > 0 ){
                        const compare = await hash.compare(password, rows[0].password)
                        if(compare){
                            req.session.loggedin = true;
                            req.session.name = rows[0].name;
                            req.session.role = rows[0].role;
                            res.redirect('/admin/dashboard');
                        }else{
                            req.flash('alertMessage', 'Email and password does not match!')
                            req.flash('alertStatus','danger')
                            res.redirect('/admin/login')
                        }
                    }
     
                }            
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus','danger')
            res.redirect('/admin/login')
        }
    },
    logout: async(req,res) => {
        
        try {
            req.session.destroy();
            res.redirect('/admin/login');
            
        } catch (error) {
            // req.flash('alertMessage', `${error.message}`)
            // req.flash('alertStatus','danger')
            res.redirect('/admin/login')
        }
    },
    view : async (req, res) => {
        const alertMessage = req.flash('alertMessage')
        const alertStatus = req.flash('alertStatus')
        const alert = {message : alertMessage, status: alertStatus}
        
        try {
            
            if (req.session.loggedin) {
                // User the connection
                await connection.query('SELECT * FROM rapid_register WHERE created_at = ?', [time()],(err, data) => {
                        connection.query('SELECT * FROM rapid_register WHERE MONTH(created_at) = MONTH(now()) and YEAR(created_at)=YEAR(now())' ,(err, waktu) => {
                            // When done with the connection, release it
                            
                            if( data.length > 0 ){
                                const stat = data[0].status
                                const gejala = data[0].gejala   
                                // When done with the connection, release it
                                res.render('admin/dashboard/view_dashboard', { 
                                    title: "Klinik App | Dashboard",
                                    alert,
                                    data,
                                    waktu,
                                    status: stat,
                                    gejala: gejala,
                                    name: req.session.name,
                                    role: req.session.role
                                });       
                            }else{
                                const stat = ""
                                const gejala = ""
                                // When done with the connection, release it
                                res.render('admin/dashboard/view_dashboard', { 
                                    title: "Klinik App | Dashboard",
                                    alert,
                                    data,
                                    waktu,
                                    status: stat,
                                    gejala: gejala,
                                    name: req.session.name,
                                    role: req.session.role
                                });  
                            }       
                                   
                        });
                });
         
            } else {
                req.flash('alertMessage', 'Please Login First!')
                req.flash('alertStatus','danger')
                res.redirect('/admin/login');
            }
           
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus','danger')
            res.redirect('/admin/dashboard')
        }
    },

    viewRegsiter_Manual : (req,res) =>{
        try {
            req.session.loggedin
            const alertMessage = req.flash('alertMessage')
            const alertStatus = req.flash('alertStatus')
            const alert = {message : alertMessage, status: alertStatus}
            res.render('admin/register_manual/view_registerManual',{
                alert,
                title: "Klinik App | Manual_Register",
                name: req.session.name,
                role: req.session.role
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus','danger')
            res.redirect('/admin/register_manual')
        }
    },

    viewRegsiter_Rfid : async(req,res) =>{
        
        client.subscribe('/rfid') 
        client.on('message', async function (topic, message){
            console.log(message.toString())
            const msg = message.toString()
            await connection.query('SELECT * FROM rfiddata WHERE rfid = ?', [ msg ],(err, data) => {
                console.log(data)
                req.app.io.emit('tes', data)
            })
        })
        // req.app.io.on( "connection", function( socket )
        // {
        //     console.log( "Hello" );
        // });
        
        res.render('admin/register_rfid/view_registerRfid',{
            title: "Klinik App | RFID",
            name: req.session.name,
            role: req.session.role
        })
    },
    viewRfid : async(req,res) => {
        const alertMessage = req.flash('alertMessage')
        const alertStatus = req.flash('alertStatus')
        const alert = {message : alertMessage, status: alertStatus}
        try {
            // User the connection
            await connection.query('SELECT * FROM rfiddata', (err, data) => {
                // When done with the connection, release it
                    res.render('admin/rfid/view_rfid',{
                        title: "Klinik App | VIEW RFID",
                        data,
                        alert,
                        name: req.session.name,
                        role: req.session.role
                    })
                });
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus','danger')
            res.redirect('/admin/rfid')
        }
        
    },

    viewUsers : async(req,res) =>{
        try {
            req.session.loggedin
            const alertMessage = req.flash('alertMessage')
            const alertStatus = req.flash('alertStatus')
            const alert = {message : alertMessage, status: alertStatus}
            await connection.query('SELECT * FROM users', (err, data) => {
                // When done with the connection, release it
                    res.render('admin/users/view_users',{
                        title: "Klinik App | View Users",
                        data,
                        alert,
                        name: req.session.name,
                        role: req.session.role
                    })
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus','danger')
            res.redirect('/admin/users')
        }
    },

    addrfidoto: async(req, res) => {
        try {
            const { name, nrp, dept, no_hp, jk, site } = req.body
            await connection.query('INSERT INTO rapid_register SET name = ?, nrp = ?, dept = ?, no_hp = ?, jk = ?, site = ?, created_at = ?', [name, nrp, dept, no_hp, jk, site, time()], (err, data) => {
                req.flash('alertMessage','Success Register Data')
                req.flash('alertStatus','success')
                res.redirect('/admin/dashboard')
            })
            
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus','danger')
            res.redirect('/admin/register_rfid')
        }
    },

    addManual: async(req, res) => {
        try {
            const { name, nrp, dept, no_hp, jk, site } = req.body
            console.log(time())
            await connection.query('INSERT INTO rapid_register SET name = ?, nrp = ?, dept = ?, no_hp = ?, jk = ?, site = ?, created_at = ?', [name, nrp, dept, no_hp, jk, site, time()], (err, data) => {
                req.flash('alertMessage','Success Register Data')
                req.flash('alertStatus','success')
                res.redirect('/admin/dashboard')
            })
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus','danger')
            res.redirect('/admin/register_manual')
        }
    },

    addrfid: async(req, res) => {
        try {
            const { rfid, name, dept, nrp, no_hp } = req.body
            await connection.query('INSERT INTO rfiddata SET name = ?, nrp = ?, dept = ?, no_hp = ?, rfid = ?', [name, nrp, dept, no_hp, rfid], (err, data) => {
                req.flash('alertMessage','Success Add Data')
                req.flash('alertStatus','success')
                res.redirect('/admin/rfid')
            })
            
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus','danger')
            res.redirect('/admin/rfid')
        }
    },

    editrfid: async(req, res) => {
        
        try {
            const { id, name, rfid, dept, nrp, no_hp} = req.body
            await connection.query('UPDATE rfiddata SET name = ?, rfid = ?, dept = ?, nrp = ?, no_hp = ? WHERE id = ?', [name, rfid, dept, nrp, no_hp, id], (err, data) => {
                req.flash('alertMessage','Success Update Data')
                req.flash('alertStatus','success') 
                res.redirect('/admin/rfid')
            })
                
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus','danger')
            res.redirect('/admin/rfid')
        }
    },

    deleterfid: async (req, res) =>{
        try {
            const { id } = req.params
            await connection.query('DELETE FROM rfiddata WHERE id = ?', [id], (err, rows) => {
                req.flash('alertMessage','Success Delete Data')
                req.flash('alertStatus','success') 
                res.redirect('/admin/rfid')
            })
            
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus','danger')
            res.redirect('/admin/rfid')
        }
    },

    status: async (req, res) => {
        try {
            const { id, status }   = req.body
            await connection.query('UPDATE rapid_register SET status = ? WHERE id = ?', [status, id], (err, data) => {
                req.flash('alertMessage', 'Success Update Status')
                req.flash('alertStatus','success')
                console.log(status+' '+id)
                res.redirect('/admin/dashboard')
            })
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus','danger')
            res.redirect('/admin/dashboard')
        }
    },

    gejala: async (req, res) => {
        try {
            const { id, gejala }   = req.body
            await connection.query('UPDATE rapid_register SET gejala = ? WHERE id = ?', [gejala, id], (err, data) => {
                req.flash('alertMessage', 'Success Update Gejala')
                req.flash('alertStatus','success')
                console.log(gejala+' '+id)
                res.redirect('/admin/dashboard')
            })
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus','danger')
            res.redirect('/admin/dashboard')
        }
    },

    printpdf: async (req, res) =>{
        try {
            
            const id = req.params.id            
            const doc = new PDFDocument();
            await connection.query('SELECT * FROM rapid_register WHERE id = ?', [ id ],(error, data) => {
                if(error) throw error;
                console.log(data)
                var filename = encodeURIComponent(data[0].name) + '.pdf';
                res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
                res.setHeader('Content-type', 'application/pdf');
                doc.rect(40, 30 , 530, 60).fillColor("#000").stroke("#000");
                doc.rect(40, 30 , 60, 60).fillColor("#000").stroke("#000");
                doc.rect(100, 70 , 470, 20).fillColor("#000").stroke("#000");
                doc.rect(380, 30 , 60, 60).fillColor("#000").stroke("#000");
                doc.rect(380, 80 , 190, 10).fillColor("#000").stroke("#000");
                doc.rect(380, 30 , 190, 10).fillColor("#000").stroke("#000");
                doc.font('Times-Bold', 5)
                    .fontSize(16)
                    .text("KLINIK PRATAMA", 165, 35);
                doc.font('Times-Bold', 5)
                    .fontSize(16)
                    .text("PT. PAMAPERSADA NUSANTARA", 115, 55);
                doc.font('Times-Bold', 5)
                    .fontSize(8)
                    .text("No. Dokumen", 385, 33);
                doc.font('Times-Bold', 5)
                    .fontSize(8)
                    .text("Tanggal Efektif", 385, 43);
                doc.font('Times-Bold', 5)
                    .fontSize(8)
                    .text("Revisi", 385, 72);
                doc.font('Times-Bold', 5)
                    .fontSize(8)
                    .text("Halaman", 385, 82);
                doc.font('Times-Roman',5)
                    .fontSize(6.5)
                    .text("PAMA/COVID-19/21/004/FORM", 445, 33);
                doc.font('Times-Roman', 5)
                    .fontSize(8)
                    .text("04 Februari 2021", 445, 43);
                doc.font('Times-Roman', 5)
                    .fontSize(8)
                    .text("1", 445, 72);
                doc.font('Times-Roman', 5)
                    .fontSize(8)
                    .text("0", 445, 82);
                doc.image(logo, 48, 33, {scale: 0.025})
                doc.font('Times-Roman', 5)
                    .fontSize(7.5)
                    .text("Jl. Rawagelam 1 No. 9, Kawasan Industri Pulogadung, Jakarta Timur 13930 - Indonesia", 105, 72);
                doc.font('Times-Roman', 5)
                    .fontSize(7.5)
                    .text("Telp. :+62 21 460 2015 (Hunting) Fax: +62 21 460 1916", 105, 82);
                doc.font('Times-Bold', 5)
                    .fontSize(16)
                    .text("SURAT KETERANGAN", 230, 110);
                doc.font('Times-Bold', 5)
                    .fontSize(16)
                    .text("HASIL PEMERIKSAAN RAPID TEST ANTIGEN COVID-19", 90, 130);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text("Yang bertandatangan di bawah ini menerangkan bahwa:", 70, 170);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text("Nama", 70, 210);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text("Jenis Kelamin",70, 228);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text("NRP",70, 246);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text("Site",70, 264);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text("Departemen",70, 282);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text("No.HP",70, 300);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text(":", 200, 210);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text(":", 200, 228);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text(":", 200, 246);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text(":", 200, 264);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text(":", 200, 282);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text(":", 200, 300);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text(data[0].name, 210, 210);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text(data[0].jk, 210, 228);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text(data[0].nrp, 210, 246);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text(data[0].site, 210, 264);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text(data[0].dept, 210, 282);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text(data[0].no_hp, 210, 300);
                
                let ts = Date.now();

                let date_ob = new Date(ts);
                let date = date_ob.getDate();
                let month = date_ob.getMonth() + 1;
                let year = date_ob.getFullYear();
                    
                // prints date & time in YYYY-MM-DD format
                //console.log(year + "-" + month + "-" + date);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text("Berdasarkan hasil pemeriksaan yang dilakukan tanggal "+date+"/"+month+"/"+year, 70, 340);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text("1. Secara klinis *", 85, 360);
                doc.moveDown()
                    .text("2. Hasil pemeriksaan Swab Rapid Test Antigen Covid-19 *")    
                if( data[0].gejala == 'DITEMUKAN'){
                    doc.font('Times-Bold', 5)
                        .fontSize(12)
                        .text(data[0].gejala, 170, 360);
                    doc.font('Times-Roman', 5)
                        .fontSize(12)
                        .text("gejala ke arah Covid-19", 250, 360);
                    doc.font('Times-Bold', 5)
                        .fontSize(12)
                        .text(data[0].status, 373, 387);
                }else if(data[0].gejala == 'TIDAK DITEMUKAN'){
                    doc.font('Times-Bold', 5)
                        .fontSize(12)
                        .text(data[0].gejala, 170, 360);
                    doc.font('Times-Roman', 5)
                        .fontSize(12)
                        .text("gejala ke arah Covid-19", 290, 360);
                    doc.font('Times-Bold', 5)
                        .fontSize(12)
                        .text(data[0].status, 373, 387);
                }else{
                    doc.font('Times-Bold', 5)
                        .fontSize(12)
                        .text("DITEMUKAN/TIDAK DITEMUKAN", 170, 360);
                    doc.font('Times-Roman', 5)
                        .fontSize(12)
                        .text("gejala ke arah Covid-19", 370, 360);
                    doc.font('Times-Bold', 5)
                        .fontSize(12)
                        .text("POSITIF/NEGATIF", 373, 387);
                }   
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text("Demikian surat keterangan ini saya buat untuk dipergunakan sebagaimana mestinya.", 70, 415);
                doc.rect(70, 435 , 475, 62).fillColor("#000").stroke("#000");
                doc.font('Times-Italic', 5)
                    .fontSize(12)
                    .text("Catatan:", 74, 438);
                doc.font('Times-Italic', 5)
                    .fontSize(12)
                    .text("Hasil Negatif tidak menyingkirkan kemungkinan infeksi Covid-19", 74, 450);
                doc.font('Times-Italic', 5)
                    .fontSize(12)
                    .text("Hasil Negatif dapat ditemukan dalam kondisi:", 74, 462);
                doc.font('Times-Italic', 5)
                    .fontSize(12)
                    .text("-  Seseorang tidak sedang dalam terinfeksi", 82, 474);
                doc.font('Times-Italic', 5)
                    .fontSize(12)
                    .text("-  Kuantitas antigen specimen di bawah level deteksi alat", 82, 486);
                doc.rect(70, 497 , 475, 110).fillColor("#000").stroke("#000");
                doc.font('Times-Italic', 5)
                    .fontSize(12)
                    .text("Saran:", 74, 500);
                doc.font('Times-Italic', 5)
                    .fontSize(12)
                    .text("Hasil Negatif:", 74, 512);
                doc.font('Times-Italic', 5)
                    .fontSize(12)
                    .text("-  Tetap lakukan physical distancing, menggunakan masler, cuci tangan sebelum makan dan", 82, 524);
                doc.font('Times-Italic', 5)
                    .fontSize(12)
                    .text("sebelum pegang area muka, dan jaga stamina", 92, 536);
                doc.font('Times-Italic', 5)
                    .fontSize(12)
                    .text("-  Kasus kontak erat, lakukan karantina mandiri sesuai ketentuan berlaku", 82, 548);
                doc.font('Times-Italic', 5)
                    .fontSize(12)
                    .text("Hasil Positif:", 74, 572);
                doc.font('Times-Italic', 5)
                    .fontSize(12)
                    .text("-  Lakukan isolasi mandiri dan ikuti prosedur yang telah ditetapkan", 82, 584);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text("Jakarta,   "+date+"/"+month+"/"+year, 380, 612);
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text("Dokter Pemeriksa", 386, 630);
                doc.image(ttd, 368, 640, {scale: 0.2})
                doc.font('Times-Roman', 5)
                    .fontSize(12)
                    .text("(..............................................)", 373, 706);
                doc.pipe(res);
                doc.end();
            })
                        // req.flash('alertMessage','Success Delete Data')
                        // req.flash('alertStatus','success') 
                        // res.redirect('/admin/dashboard')
                        
            } catch (error) {
                        req.flash('alertMessage', `${error.message}`)
                        req.flash('alertStatus','danger')
                        res.redirect('/admin/dashboard')
            }
    },

    registerUsers: async (req, res) => {
        const { name, email, password, role} = req.body
        const salt = await hash.genSalt(10)
        const encryptedPassword = await hash.hash(password, salt)
        try {
            await connection.query('INSERT INTO users SET name = ?, email = ?, password = ?, role = ?', [name, email, encryptedPassword, role], (err, data) => {
                req.flash('alertMessage','Success Register User')
                req.flash('alertStatus','success')
                res.redirect('/admin/users')
            })
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus','danger')
            res.redirect('/admin/users')
        }

    },

    editusers: async(req, res) => {
        
        try {
            const { id, name, email, password, role} = req.body
            console.log(password.length)
            const salt = await hash.genSalt(10)
            const encryptedPassword = await hash.hash(password, salt)
            if(password.length > 0){

                await connection.query('UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?', [name, email, encryptedPassword, role, id], (err, data) => {
                    req.flash('alertMessage','Success Update Data')
                    req.flash('alertStatus','success') 
                    res.redirect('/admin/users')
                })
            }else{
                await connection.query('UPDATE users SET name = ?, email = ? ,role = ? WHERE id = ?', [name, email, role, id], (err, data) => {
                    req.flash('alertMessage','Success Update Data')
                    req.flash('alertStatus','success') 
                    res.redirect('/admin/users')
                })
            }
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus','danger')
            res.redirect('/admin/users')
        }
    },

    deleteusers: async (req, res) =>{
        try {
            const { id } = req.params
            await connection.query('DELETE FROM users WHERE id = ?', [id], (err, rows) => {
                req.flash('alertMessage','Success Delete Data')
                req.flash('alertStatus','success') 
                res.redirect('/admin/users')
            })
            
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus','danger')
            res.redirect('/admin/users')
        }
    },


}


