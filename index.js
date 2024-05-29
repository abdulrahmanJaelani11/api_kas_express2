const express = require("express");
const app = express()
const myql = require("mysql")
const cors = require("cors")
const moment = require("moment")
require("moment/locale/id");
const bodyParser = require("body-parser")
const db = myql.createConnection({
    host: "aaj.h.filess.io",
    user: "sicakas_mustvapor",
    password : "820688fef06604fd1425f7227e6dce4b5fbd5257",
    database : "sicakas_mustvapor",
    port : "3307",
})
const port = process.env.port || 3000

app.use(cors());
app.use(bodyParser.json());

app.get("/api/get-status", (req, res) => {
    let query = "SELECT * FROM ref_status";
    db.query(query, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });
  
  app.get("/api/get-status/:id", (req, res) => {
    let query = `SELECT * FROM ref_status WHERE id = ${req.params.id}`;
    db.query(query, (err, results) => {
      if (err) throw err;
      res.json(results[0]);
    });
  });
  
  app.put("/api/status/:id", (req, res) => {
    let { status, biaya, created_date, created_by, updated_date, updated_by } =
      req.body;
    const status_id = req.params.id;
    const query = "UPDATE ref_status SET status = ?, biaya = ? WHERE id = ?";
    const values = [status, biaya, status_id];
  
    db.query(query, values, (err, results) => {
      if (err) throw err;
      res.json({ status: 200, message: "Status berhasil diupdate" });
    });
  });
  
  app.post("/api/status", (req, res) => {
    let { status, biaya, created_date, created_by, updated_date, updated_by } =
      req.body;
    const status_id = req.params.id;
    const query = "INSERT INTO ref_status (status, biaya) VALUES (?, ?)";
    const values = [status, biaya];
  
    db.query(query, values, (err, results) => {
      if (err) throw err;
      res.json({
        status: 200,
        message: "Status berhasil menambahkan data status",
      });
    });
  });
  
  // ANGGOTA
  app.get("/api/get-anggota", cors(), (req, res) => {
    let query =
      "SELECT a.*, b.status, b.biaya FROM ref_anggota as a LEFT JOIN ref_status as b ON a.status_id = b.id ORDER BY a.nama ASC";
    db.query(query, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });
  
  app.post("/api/anggota", (req, res) => {
    let { anggota, status } = req.body;
    const query =
      "INSERT INTO ref_anggota (nama, status_id, active) VALUES (?, ?, ?8)";
    const values = [anggota, status, 1];
    db.query(query, values, (err, results) => {
      if (err) throw err;
      res.status(201).json({
        status: 200,
        message: "Status berhasil menambahkan data anggota",
      });
    });
  });
  
  app.get("/api/get-anggota/:id", (req, res) => {
    const query = `SELECT * FROM ref_anggota WHERE id = ${req.params.id}`;
    db.query(query, (err, results) => {
      if (err) throw err;
      res.json(results[0]);
    });
  });
  
  app.put("/api/anggota/:id", (req, res) => {
    let { anggota, status } = req.body;
    const anggota_id = req.params.id;
    const values = [anggota, status, anggota_id];
    const query = `UPDATE ref_anggota SET nama = ?, status_id = ? WHERE id = ?`;
    db.query(query, values, (err, rasult) => {
      if (err) throw err;
      res.status(201).json({ status: 200, message: "Berhasil mengubah anggota" });
    });
  });
  
  app.get("/api/cari-anggota/:keyword", (req, res) => {
    const sql = `SELECT a.*, b.status, b.biaya FROM ref_anggota as a LEFT JOIN ref_status as b ON a.status_id = b.id WHERE a.nama LIKE  '%${req.params.keyword}%'`;
    db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });
  
  // TAHUN
  app.get("/api/get-tahun", (req, res) => {
    let query = "SELECT a.* FROM ref_tahun as a";
    db.query(query, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });
  
  // BULAN
  app.get("/api/get-bulan", (req, res) => {
    let query = "SELECT a.* FROM ref_bulan as a";
    db.query(query, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });
  
  // PEMBAYARAN
  
  app.post("/api/pembayaran", (req, res) => {
    let { anggota_id, tahun_id, bulan_id, tipe_transaksi, nominal, keterangan } =
      req.body;
    const sql_cek = `SELECT a.nominal, b.nama, c.tahun, d.bulan FROM trans_pembayaran a
    JOIN ref_anggota b ON a.anggota_id = b.id
    JOIN ref_tahun c ON a.tahun_id = c.id
    JOIN ref_bulan d ON a.bulan_id = d.id
    WHERE anggota_id = ${anggota_id} AND tahun_id = ${tahun_id} AND bulan_id = ${bulan_id}`;
  
    const query =
      "INSERT INTO trans_pembayaran (anggota_id, tahun_id, bulan_id, tipe_transaksi, nominal, status, created_date, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    let today = moment().format("YYYY-MM-DD HH:mm:ss");
    const values = [
      parseInt(anggota_id),
      tahun_id,
      bulan_id,
      tipe_transaksi,
      parseInt(nominal),
      1,
      today,
      keterangan,
    ];
  
    let dt_anggota;
    db.query(sql_cek, (err, result) => {
      if (err) throw err;
      dt_anggota = result[0];
      if (result.length == 0) {
        db.query(query, values, (err, results) => {
          if (err) throw err;
          res.status(200).json({
            status: 200,
            message: "Berhasil menyimpan data pembayaran",
          });
        });
      } else {
        res.status(200).json({
          status: 400,
          message: `Anggota dengan nama ${dt_anggota.nama} telah membayar uang kas tahun ${dt_anggota.tahun}, bulan ${dt_anggota.bulan} sebesar ${dt_anggota.nominal}`,
        });
      }
    });
  });
  
  app.post("/api/pembayaran-sekaligus", (req, res) => {
    let { anggota_id, tahun_id, tot_tagihan } = req.body;
    let is_err = false;
    const sql_cek = `SELECT tbl.* FROM (SELECT a.id, a.bulan, b.nominal FROM ref_bulan a
      LEFT JOIN trans_pembayaran b ON b.bulan_id = a.id AND b.anggota_id = ${anggota_id} AND b.tahun_id = ${tahun_id}) as tbl
      WHERE tbl.nominal IS NULL`;
  
    const query =
      "INSERT INTO trans_pembayaran (anggota_id, tahun_id, bulan_id, tipe_transaksi, nominal, status, created_date, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    let today = moment().format("YYYY-MM-DD HH:mm:ss");
    let dt_anggota;
    db.query(sql_cek, (err, result) => {
      let nominal = tot_tagihan / result.length;
      if (err) throw err;
  
      for (let i = 0; i < result.length; i++) {
        let values = [
          parseInt(anggota_id),
          tahun_id,
          result[i].id,
          "pemasukan",
          parseInt(nominal),
          1,
          today,
          "keterangan",
        ];
  
        db.query(query, values, (err, result) => {
          if (err) {
            is_err = true;
          }
        });
  
        values = [];
      }
  
      // dt_anggota = result[0];
      if (!is_err) {
        res.status(200).json({
          status: 200,
          message: "Berhasil menyimpan data pembayaran",
        });
      } else {
        res.status(200).json({
          status: 400,
          message: `Anggota dengan nama ${dt_anggota.nama} telah membayar uang kas tahun ${dt_anggota.tahun}, bulan ${dt_anggota.bulan} sebesar ${dt_anggota.nominal}`,
        });
      }
    });
  });
  
  app.get(`/api/get-pembayaran-det/:id/:tahun`, (req, res) => {
    const sql = `SELECT a.*, b.nominal, b.created_date, c.tahun FROM ref_bulan a 
    LEFT JOIN trans_pembayaran b ON a.id = b.bulan_id AND b.anggota_id = ${req.params.id} AND b.tahun_id = ${req.params.tahun}
    LEFT JOIN ref_tahun c ON b.tahun_id = c.id
    ORDER BY a.id`;
    db.query(sql, (err, result) => {
      if (err) throw err;
      for (let i = 0; i < result.length; i++) {
        result[i].created_date =
          result[i].created_date != null
            ? moment(result[i].created_date).format("dddd, D MMMM YYYY HH:mm:ss")
            : "-";
        result[i].nominal =
          result[i].nominal != null
            ? parseInt(result[i].nominal).toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              })
            : "Rp 0";
      }
      res.status(200).json(result);
    });
  });
  
  app.get("/api/get-total-tagihan/:id/:tahun", (req, res) => {
    const sql = `SELECT COUNT(id) as jml_bulan FROM
    (SELECT a.*, b.nominal, b.created_date, c.tahun FROM ref_bulan a 
      LEFT JOIN trans_pembayaran b ON a.id = b.bulan_id AND b.anggota_id = ${req.params.id} AND b.tahun_id = ${req.params.tahun}
      LEFT JOIN ref_tahun c ON b.tahun_id = c.id
      ORDER BY a.id) as tbl
      WHERE tbl.nominal IS NULL`;
    const sql_stts = `SELECT a.*, b.biaya FROM ref_anggota a
    JOIN ref_status b ON a.status_id = b.id
    WHERE a.id = ${req.params.id}`;
    db.query(sql_stts, (err, result_stts) => {
      if (err) throw err;
  
      db.query(sql, (err, result) => {
        if (err) throw err;
        let response = result_stts[0].biaya * result[0].jml_bulan;
        res.json({
          total_tagihan: response,
        });
      });
    });
  });
  
  // RIWAYAT
  app.get("/api/get-riwayat", cors(), (req, res) => {
    const query = `SELECT b.nama as nama_anggota, a.nominal, a.created_date, a.tipe_transaksi, c.bulan, d.tahun
    FROM trans_pembayaran a 
    LEFT JOIN ref_anggota b ON a.anggota_id = b.id 
    LEFT JOIN ref_bulan c ON a.bulan_id = c.id
    LEFT JOIN ref_tahun d ON a.tahun_id = d.id
    ORDER BY a.id DESC`;
    db.query(query, (err, result) => {
      if (err) throw err;
      for (let i = 0; i < result.length; i++) {
        result[i].created_date = moment(result[i].created_date).format(
          "dddd, D MMMM YYYY"
        );
      }
      res.json(result);
    });
  });
  
  app.post("/api/get-riwayat-filter", (req, res) => {
    let filter =
      req.body.anggota != 0 ? `AND a.anggota_id = '${req.body.anggota}'` : "";
    const query = `SELECT b.nama as nama_anggota, a.nominal, a.created_date, a.tipe_transaksi, c.bulan, d.tahun
    FROM trans_pembayaran a 
    LEFT JOIN ref_anggota b ON a.anggota_id = b.id 
    LEFT JOIN ref_bulan c ON a.bulan_id = c.id
    LEFT JOIN ref_tahun d ON a.tahun_id = d.id
    WHERE a.created_date BETWEEN '${req.body.tgl_awal}' AND '${req.body.tgl_akhir}' ${filter}
    ORDER BY a.id ASC`;
    db.query(query, (err, result) => {
      if (err) throw err;
      for (let i = 0; i < result.length; i++) {
        result[i].created_date = moment(result[i].created_date).format(
          "dddd, D MMMM YYYY"
        );
        result[i].nominal = parseInt(result[i].nominal).toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        });
      }
      res.json(result);
    });
  });
  
  // DASHBOARD
  app.get("/api/get-saldo", (req, res) => {
    const sql = `SELECT tbl.*, (tbl.saldo_pemasukan - tbl.saldo_pengeluaran) as total FROM (
      SELECT
        SUM( nominal ) AS saldo_pemasukan,
        ( SELECT SUM( nominal ) FROM trans_pembayaran WHERE tipe_transaksi = 'pengeluaran' ) AS saldo_pengeluaran 
      FROM
        trans_pembayaran 
      WHERE
        tipe_transaksi = 'pemasukan') as tbl`;
    db.query(sql, (err, result) => {
      if (err) throw err;
      res.json(result[0].total);
    });
  });
  
  app.get("/api/get-transaksi-hari-ini", (req, res) => {
    const query = `SELECT a.id, b.nama as nama_anggota, a.nominal, a.tipe_transaksi, a.created_date, c.bulan, d.tahun 
    FROM trans_pembayaran a 
    LEFT JOIN ref_anggota b ON a.anggota_id = b.id
    LEFT JOIN ref_bulan c ON a.bulan_id = c.id
    LEFT JOIN ref_tahun d ON a.tahun_id = d.id
    ORDER BY a.id DESC LIMIT 5`;
    db.query(query, (err, result) => {
      if (err) throw err;
      for (let i = 0; i < result.length; i++) {
        result[i].created_date = moment(result[i].created_date).format(
          "dddd, D MMMM YYYY"
        );
      }
      res.json(result);
    });
  });
  
  app.get("/api/get-detail-transaksi", (req, res) => {
    const sql = `SELECT 
    (SELECT SUM(x.nominal) FROM trans_pembayaran x
    WHERE x.tipe_transaksi = 'pemasukan' AND DATE(x.created_date) = DATE(a.created_date)) as pemasukan,
    (SELECT SUM(nominal) FROM trans_pembayaran y
    WHERE y.tipe_transaksi = 'pengeluaran' AND DATE(y.created_date) = DATE(a.created_date)) as pengeluaran,
    DATE(a.created_date) as date
    FROM trans_pembayaran a GROUP BY DATE(a.created_date) ORDER BY DATE(created_date) DESC`;
  
    db.query(sql, (err, result) => {
      if (err) throw err;
      for (let i = 0; i < result.length; i++) {
        result[i].tgl = moment(result[i].date).format("dddd, D MMMM YYYY");
      }
      res.json(result);
    });
  });
  
  // LOGIN
  app.post(`/api/auth`, cors(), (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT a.*, c.status FROM sec_user a 
    LEFT JOIN ref_anggota b ON a.anggota_id = b.id
    LEFT JOIN ref_status c ON b.status_id = c.id WHERE a.username = '${username}'`;
    db.query(query, (err, result) => {
      if (err) throw err;
      if (result.length > 0 && result[0].password == password) {
        res.json({
          status: 200,
          message: "Berhasil Login",
          result,
        });
      } else {
        res.json({
          status: 400,
          message: "Username atau Password yang anda masukan salah!",
        });
      }
    });
  });
  
  app.put(`/api/profile/:id`, (req, res) => {
    const id = req.params.id;
    const { full_name } = req.body;
    const query = `UPDATE sec_user SET full_name = ? WHERE id = ?`;
    const values = [full_name, id];
  
    db.query(query, values, (err, results) => {
      if (err) throw err;
      res.status(200).json({
        status: 200,
        message: "Berhasil merubah nama lengkap",
      });
    });
  });
  
  // PEMASUKAN
  app.get(`/api/get-pemasukan`, (req, res) => {
    const sql = `SELECT SUM(nominal) as pemasukan FROM trans_pembayaran WHERE DATE(created_date) = CURRENT_DATE() AND tipe_transaksi = 'pemasukan'`;
    db.query(sql, (err, result) => {
      if (err) throw err;
      res.status(200).json(result[0]);
    });
  });
  
  // PEMASUKAN
  app.get(`/api/get-pengeluaran`, (req, res) => {
    const sql = `SELECT SUM(nominal) as pengeluaran FROM trans_pembayaran WHERE DATE(created_date) = CURRENT_DATE() AND tipe_transaksi = 'pengeluaran'`;
    db.query(sql, (err, result) => {
      if (err) throw err;
      res.status(200).json(result[0]);
    });
  });
  
  app.get("/api/generate-pdf", (req, res) => {
    const sql = `SELECT b.nama as nama_anggota, a.nominal, a.created_date, a.tipe_transaksi
    FROM trans_pembayaran a 
    LEFT JOIN ref_anggota b ON a.anggota_id = b.id ORDER BY a.id DESC`;
  
    db.query(sql, (err, result) => {
      if (err) throw err;
      let path = `./file_temp`;
      let file_name = `output.pdf`;
      let fullpath = path + "/" + file_name;
      res.json({ fullpath });
      // res.download(fullpath, file_name, (err) => {
      //   if (err) {
      //   }
      // else {
      //   fs.unlinkSync(fullpath);
      // }
      // });
      // Read HTML Template
      // let data = {
      //   data: [],
      //   tot_pemasukan: 0,
      //   tot_pengeluaran: 0,
      //   tot_saldo: 0,
      // };
      // let tot_pemasukan = 0;
      // let tot_pengeluaran = 0;
      // for (let i = 0; i < result.length; i++) {
      //   data.data.push({
      //     nomor: i + 1,
      //     nama_anggota: result[i].nama_anggota,
      //     tipe_transaksi: result[i].tipe_transaksi,
      //     nominal: parseInt(result[i].nominal).toLocaleString("id-ID", {
      //       style: "currency",
      //       currency: "IDR",
      //     }),
      //     created_date: moment(result[i].created_date).format(
      //       "dddd, D MMMM YYYY"
      //     ),
      //   });
  
      //   if (result[i].tipe_transaksi == "pemasukan")
      //     tot_pemasukan += parseInt(result[i].nominal);
  
      //   if (result[i].tipe_transaksi == "pengeluaran")
      //     tot_pengeluaran += parseInt(result[i].nominal);
      // }
  
      // data.tot_pemasukan = tot_pemasukan.toLocaleString("id-ID", {
      //   style: "currency",
      //   currency: "IDR",
      // });
      // data.tot_pengeluaran = tot_pengeluaran.toLocaleString("id-ID", {
      //   style: "currency",
      //   currency: "IDR",
      // });
      // data.tot_saldo = (tot_pemasukan - tot_pengeluaran).toLocaleString("id-ID", {
      //   style: "currency",
      //   currency: "IDR",
      // });
  
      // var html = fs.readFileSync("./template/transaksi.html", "utf8");
      // let path = `./file_temp`;
      // let file_name = `output.pdf`;
      // let fullpath = path + "/" + file_name;
  
      // var options = {
      //   format: "A4",
      //   orientation: "portrait",
      //   border: "10mm",
      //   header: {
      //     height: "5mm",
      // contents:
      // '<div style="text-align: center;">Author: Abdul Rahman Jaelani</div>',
      // },
      // footer: {
      //   height: "28mm",
      //   contents: {
      //     first: "Cover page",
      //     2: "Second page", // Any page number is working. 1-based index
      //     default:
      //       '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
      //     last: "Last Page",
      //   },
      // },
      // };
  
      // var document = {
      //   html: html,
      //   data: {
      //     dt_transaksi: data,
      //   },
      //   path: fullpath,
      //   type: "",
      // };
      // const proses = pdf.create(document, options);
      // if (proses) {
      //   res.download(fullpath, file_name, (err) => {
      //     if (err) {
      //     } else {
      //       fs.unlinkSync(fullpath);
      //     }
      //   });
      // }
    });
  
    // Menambahkan konten ke PDF
  });
  
  // GANTI PASSWORD
  app.post(`/api/ganti-password/:id`, (req, res) => {
    const id = req.params.id;
    const { password_lama, password_baru } = req.body;
    const sql_cek = `SELECT * FROM sec_user WHERE id = ${id}`;
    const sql = `UPDATE sec_user SET password = ? WHERE id = ?`;
    const values = [password_baru, id];
    db.query(sql_cek, (err, result) => {
      if (err) throw err;
      if (result[0].password == password_lama) {
        db.query(sql, values, (err, result) => {
          if (err) throw err;
          res.json({
            status: 200,
            message: `Berhasil Mengubah password, silahkan login kembali menggunakan password baru anda`,
          });
        });
      } else {
        res.json({
          status: 400,
          message: `Maaf, password saat ini yang anda masukan salah, silahkan coba lagi`,
        });
      }
    });
  });

app.listen(port, () => {
    console.log(`Server berjalan di localhost:${port}`)
})