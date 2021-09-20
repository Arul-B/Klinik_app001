module.exports = {
    get: function(con, callback){
        con.query("SELECT * FROM rfiddata")
    },

    getById: function(con, id, callback){
        con.query(`SELECT * FROM rfiddata WHERE id = ${id}`, callback)
    },

    create: function(con, data, callback) {
        con.query(
            `INSERT INTO rfiddata SET
            rfid = '${data.rfid}',
            name = '${data.name}',
            nrp = '${data.nrp}',
            dept = '${data.dept}',
            no_hp = '${data.no_hp}',`,
            callback
        )
    },

    update: function(con, data, id, callback) {
        con.query(
            `UPDATE rfiddata SET
            rfid = '${data.rfid}',
            name = '${data.name}',
            nrp = '${data.nrp}',
            dept = '${data.dept}',
            no_hp = '${data.no_hp}'
            WHERE id = ${id}`,
            callback
        )
    },

    delete: function(con, id, callback) {
        con.query(`DELETE FROM rfiddata WHERE id = ${id}`, callback)
    }

}