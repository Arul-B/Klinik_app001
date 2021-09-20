module.exports = {
    get: function(con, callback){
        con.query("SELECT * FROM rapid_register")
    },

    getById: function(con, id, callback){
        con.query(`SELECT * FROM rapid_register WHERE id = ${id}`, callback)
    },

    create: function(con, data, callback) {
        con.query(
            `INSERT INTO rapid_register SET
            name = '${data.name}',
            nrp = '${data.nrp}',
            dept = '${data.dept}',
            no_hp = '${data.no_hp}',
            jk = '${data.jk}',
            site = '${data.site}',
            created_at = '${data.created_at}'`,
            callback
        )
    },

    update: function(con, data, id, callback) {
        con.query(
            `UPDATE rapid_register SET
            name = '${data.name}',
            nrp = '${data.nrp}',
            dept = '${data.dept}',
            no_hp = '${data.no_hp}',
            jk = '${data.jk}',
            site = '${data.site}',
            created_at = '${data.created_at}'
            WHERE id = ${id}`,
            callback
        )
    },

    delete: function(con, id, callback) {
        con.query(`DELETE FROM rapid_register WHERE id = ${id}`, callback)
    }

}