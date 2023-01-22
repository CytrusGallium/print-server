const express = require("express");
const app = express();
const fileupload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const ptp = require("pdf-to-printer");
const { exec } = require('child_process');
const cors = require("cors");

// ...
console.log('Platform:', process.platform);

// Create upload directory
const uploadDirectory = "./Uploads/";
console.log('Upload Directory:', uploadDirectory);
console.log('===================================');

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
}

// ...
const PrintFile = (ParamFilePath, ParamPrinterName) => {
    // if (process.platform != 'win32') {
    //     printer.printFile({
    //         filename: ParamFilePath,
    //         printer: ParamPrinterName, // printer name, if missing then will print to default printer
    //         success: function (jobID) {
    //             console.log("sent to printer with ID: " + jobID);
    //         },
    //         error: function (err) {
    //             console.log(err);
    //         }
    //     });
    // }
}

// ...
const StringToFile = (ParamString) => {
    const path = uploadDirectory + '_' + timeStamp + ".txt";
    fs.writeFile(path, ParamString, function (err) {
        if (err) {
            return console.log("TXT_TO_FILE_EERROR : " + err);
        }
        console.log("The file was saved.");
        return path;
    });

    return "";
}

app.use(cors({
    origin: '*'
}));
app.use(fileupload());

app.get("/", (req, res, next) => {

    exec('wmic printer list brief', (err, stdout, stderr) => {
        if (err) {
            // Node couldn't execute the command
            return;
        }
        // list of printers with brief details
        console.log(stdout);
        // the *entire* stdout and stderr (buffered)
        stdout = stdout.split("  ");
        var printers = [];
        j = 0;
        stdout = stdout.filter(item => item);
        for (i = 0; i < stdout.length; i++) {
            if (stdout[i] == " \r\r\n" || stdout[i] == "\r\r\n") {
                printers[j] = stdout[i + 1];
                j++;
            }
        }
        // list of only printers name
        console.log(printers);
        console.log(stderr);
        res.status(200).send("Welcome to Nukode's print server. In order to print post a PDF file to localhost:5000/upload where you assign your file to the pdf POST parameter.<br/>Here is an array of available printers : " + JSON.stringify(printers));
    });

});

app.post("/print", (req, res, next) => {

    console.log("Print request received : PDF MODE");
    const file = req.files.pdf;

    const options = {};
    if (req.query.printer) {
        options.printer = req.query.printer;
        console.log("PRINTER = " + options.printer);
    }

    const timeStamp = Date.now();
    const path = uploadDirectory + file.name + "_" + timeStamp;
    file.mv(path, async (err, result) => {

        console.log("MV Result (Raw) = " + result);
        console.log("MV Result (JSON) = " + JSON.stringify(result));

        if (err)
            throw err;

        try {
            await ptp.print(path, options);
        } catch (error) {
            console.log("PRINT_TO_PDF_ERROR : " + error);
        }

        res.status(200).send({
            success: true,
            message: "File uploaded!"
        });
    });

});

app.post("/print-txt", (req, res, next) => {

    console.log("TXT MODE");
    const txt = req.body.txt;

    const file = StringToFile(txt);
   
    const printerName = "";
    if (req.query.printer) {
        printerName = req.query.printer;
        console.log("PRINTER = " + printerName);
    }

    PrintFile(file, printerName);

    res.status(200).send({
        success: true,
        message: "File uploaded!"
    });
});

app.listen(5000, () => {
    console.log("Print Server started on port 5000");
});