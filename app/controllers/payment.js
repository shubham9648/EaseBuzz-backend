const sha512 = require("js-sha512");
const axios = require("axios");
const qs = require("qs");
const { MongoClient } = require("mongodb")
const clients = new MongoClient("mongodb+srv://admin:testAdmin@cluster0.imb0owx.mongodb.net");
const uuid = require("uuid");

exports.mongoConnect = async (req, res, next) => {
  try {
      const body = req.body
      const filter = {
          FirstName: "some",
          MiddleName: "some name",
      }
      // var cursor
      console.log("filter is ", filter);
      clients.connect(err => {
          console.log("MongoDB connected for Beyblade.js")
          const ids = clients.db("friends-verifier").collection("criminals")
          ids.find({filter}).toArray(function(err, result) {
             // the variable result is an array of the documents, do something with them
             console.log(result)    // this will print the documents from the collection
          })
      })
      // const response = await client.clusterSearch(req, res);     
      // responseHandler("result", res);
      res.send("ok")
  } catch (err) {
      console.log("error is ", err);
      next(err);
  }
}

exports.initiatePayment = async (req, res, next) => {
    try {

      const body = req.body;
      body.txnid = uuid.v4();

      if(!validator(body)){
        res.send(400, "Error Occured!");
      }
      const url = process.env.staging == 'test' ? "https://testpay.easebuzz.in/" : process.env.staging == 'prod' ? 'https://pay.easebuzz.in/' : "https://testpay.easebuzz.in/"
      const call_url = url + 'payment/initiateLink';
      const hashKey = await generateHash(body)
      const formData = await form(body, hashKey);
      let option = {
        method: "post",
        url: call_url,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
        data : formData
      };
      console.log("config is", option);
      const response = await axios(option);
      console.log("response is ", response.data);
      const redirectUrl = `https://testpay.easebuzz.in/pay/${response.data.data}`
      console.log("url is", redirectUrl);
      //https://testpay.easebuzz.in/pay/85d72d80bd5e960074b98292fc0eca18df8b6a9dcd3bbd06c6371324297f05b7
      res.json({url: redirectUrl});
    } catch (err) {
        console.log("error is ", err);
    }
}



const validator = (body) => {
    if(!body.txnid ||
       !isFloat(body.amount) || 
       !body.name ||
       !body.email ||
       !body.phone ||
       !body.productinfo
        ){
            return false;
        }
}

const isFloat = (amt) => {
    var regexp = /^\d+\.\d{1,2}$/;
    return regexp.test(amt)
}; 


const  form = (data, hash) => {
  console.log("hash is", hash);
    var form = qs.stringify({
      'key': process.env.key,
      'txnid': data.txnid,
      'amount': data.amount,
      'email': data.email,
      'phone': data.phone,
      'firstname': data.name,
      'hash': hash,
      'productinfo': data.productinfo,
      'furl': 'https://www.google.com/success',
      'surl': 'https://www.google.com/fail'
    })
    if (data.unique_id != '') {
      form.unique_id = data.unique_id
    }
    if (data.split_payments != '') {
      form.split_payments = data.split_payments
    }

    if (data.sub_merchant_id != '') {
      form.sub_merchant_id = data.sub_merchant_id
    }

    if (data.customer_authentication_id != '') {
      form.customer_authentication_id = data.customer_authentication_id
    }

    return form;
  }

  const  generateHash = (data) => {
    console.log("keys are", process.env.key, process.env.salt);
    var hashstring = `${process.env.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.name}|${data.email}|||||||||||${process.env.salt}`
    console.log("hash is ", hashstring);
    data.hash = sha512.sha512(hashstring);
    return (data.hash);
}

exports.checkStatus = async (req, res) => {
  try {
    // const hashKeyTrans = await generateHash(req.body)
    const data = req.body
    let formData1 = {
      'key': process.env.key,
      'txnid': data.txnid,
      'amount': data.amount,
      'email': data.email,
      'phone': data.phone,
      'hash': generateHashTrans(req.body),
    }
    let option = {
      method: "post",
      url: "https://testpay.easebuzz.in/transaction/v1/retrieve",
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      data : formData1
    };
    console.log("option is ", option);
    const response = await axios(option);
    console.log("response is ", response.data);
    res.json(response.data)
  } catch (err) {
    console.log("error is", err);
  }
}

const generateHashTrans = (data) => {
  const hashstring = `${process.env.key}|${data.txnid}|${data.amount}|${data.email}|${data.phone}|${process.env.salt}`
    console.log("hash string is", hashstring);
  const hashTrans = sha512.sha512(hashstring);
  return hashTrans
}