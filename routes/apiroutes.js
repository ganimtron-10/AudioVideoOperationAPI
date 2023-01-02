import express from "express";
import { v4 as uuidv4 } from 'uuid';
import multer from "multer";
import fs from "fs";
import gTTS from 'gtts';
import path from "path";
import videoshow from "videoshow";
import videoStitch from 'video-stitch';
import ffmpeg from "fluent-ffmpeg";

var storage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, `public/uploads/${req.cookies.token}`);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname.replaceAll(" ", "_"));
    }
});
var upload = multer({ storage });




const router = express.Router();

router.route("/").get((req, res) => {
    res.send("Welcome to Audio Video Operation API!");
})

router.route("/create_new_storage").post(async (req, res) => {

    if (req.cookies.token == null) {
        const usertoken = uuidv4();
        await fs.mkdir(`public/uploads/${usertoken}`, { recursive: true }, err => {
            if (err) {
                throw err
            }
        });
        res.cookie("token", usertoken, {
            secure: true,
            httpOnly: true,
            sameSite: 'strict',
        });
        res.json({
            "status": "ok",
            "message": "Storage Created Sucessfully"
        });
    } else {
        res.json({
            "status": "ok",
            "message": "Storage Already Created"
        });
    }


})

router.route("/upload_file").post(upload.single('my_file'), (req, res) => {


    if (req.cookies.token == null) {
        res.status(401).send("Create a Storage token first!");
    } else {

        const file = req.file;
        if (!file) {
            return res.status(400).send({ message: 'Please upload a file.' });
        }

        res.json({
            "status": "ok",
            "file_path": file.path.replaceAll("\\", "/"),
        });
    }

})

router.route("/my_upload_file").get((req, res) => {

    try {
        const dir = `public/uploads/${req.cookies.token}/`
        const files = fs.readdirSync(dir);
        let filedata = [];
        files.forEach(file => {
            filedata.push(`${dir}${file}`);
        })
        res.json({
            "status": "ok",
            "data": filedata
        });
    } catch (err) {
        res.status(500).json(err);
    }


})

router.route("/text_file_to_audio").post((req, res) => {

    // (json)
    //  {
    // "file_path": "public/upload/6bc5277a-b3ac-477e-b71d-998c156bc0da.txt"
    //    }
    const textfilename = req.body.file_path;
    const filedata = fs.readFileSync(textfilename, "utf-8");


    var gtts = new gTTS(filedata, 'en');
    const outputfilename = `${path.dirname(textfilename)}/${path.basename(textfilename, path.extname(textfilename))}.mp3`;
    gtts.save(outputfilename, function (err, result) {
        if (err) { throw new Error(err) }
        // console.log(`Success! Open file ${outputfilename} to hear result.`);
    });

    res.json({
        "status": "ok",
        "message": "text to speech converted",
        "audio_file_path": outputfilename
    });
})


router.route("/merge_image_and_audio").post((req, res) => {

    // (json)
    // {
    //  "image_file_path": "public/upload/20a4dc79-dc67-43c9-b61c-a0e4aceb3de7.jpg" ,
    //  "audio_file_path": "public/upload/4839379a-4d0a-440e-943f-e1e4b0ebfdb7.mp3"
    //   } 

    var audio = req.body.audio_file_path;

    var images = [req.body.image_file_path];

    let videofilename = `${path.dirname(audio)}/${path.basename(images[0], path.extname(images[0]))}-${path.basename(audio, path.extname(audio))}.mp4`;

    console.log(videofilename);

    videoshow(images)
        .audio(audio)
        .save(videofilename)
        .on('start', function (command) {
            console.log('ffmpeg process started:', command)
        })
        .on('error', function (err) {
            console.error('Error:', err)
        })
        .on('end', function (output) {
            console.log('Video created in:', output)
            res.json(
                {
                    "status": "ok",
                    "message": "Video Created Successfully",
                    "video_file_path": videofilename
                });
        })


})

router.route("/merge_video_and_audio").post((req, res) => {

    //     (json)
    //   {
    //    "video_file_path":"public/upload/893adf65-9c49-4d74-9add-36ca23c6361c.mp4", 
    //     "audio_file_path": "public/upload/4839379a-4d0a-440e-943f-e1e4b0ebfdb7.mp3"
    //   }
    const video_file_path = req.body.video_file_path
    const audio_file_path = req.body.audio_file_path

    let outputVideoFileName = `${path.basename(video_file_path, path.extname(video_file_path))}${path.basename(audio_file_path, path.extname(audio_file_path))}.mp4`
    outputVideoFileName = path.resolve(`${path.dirname(video_file_path)}/${outputVideoFileName}`)

    ffmpeg()
        .input(path.resolve(video_file_path))
        .input(path.resolve(audio_file_path))
        .output(outputVideoFileName)
        .on('end', () => {
            console.log('Merging completed!');
            res.json({
                "status": "ok",
                "message": "Video and Audio Merged Successfully",
                "video_file_path": outputVideoFileName.replaceAll("\\", "/")
            });
        })
        .run();


})

router.route("/merge_all_video").post((req, res) => {
    //     (json)
    //   {
    //     "video_file_path_list": [
    //         "public/upload/893adf65-9c49-4d74-9add-36ca23c6361c.mp4",
    //         "public/upload/8sda23df65-9c49-4d74-9add-36daaa2341c.mp4",
    //         "public/upload/7f55e680-67dc-4721-ba45-a8a738c68e5a.mp4"
    //     ]
    // }

    let videoarray = [];
    let outputVideoFileName = "";
    req.body.video_file_path_list.forEach((file) => {
        videoarray.push({ "fileName": path.resolve(file) });
        outputVideoFileName += path.basename(file, path.extname(file));
    })
    outputVideoFileName += ".mp4";
    outputVideoFileName = path.resolve(`${path.dirname(videoarray[0].fileName)}/${outputVideoFileName}`)
    console.log(outputVideoFileName);


    let videoConcat = videoStitch.concat;

    videoConcat({
        silent: true, // optional. if set to false, gives detailed output on console
        overwrite: true // optional. by default, if file already exists, ffmpeg will ask for overwriting in console and that pause the process. if set to true, it will force overwriting. if set to false it will prevent overwriting.
    }).clips([
        {
            "fileName": path.resolve("public/uploads/2659ddd1-a155-4a0c-a023-9aef7bcbfd65/GSoC-mera_dil_ye_pukare_trim.mp4")
        },
        {
            "fileName": path.resolve("public/uploads/2659ddd1-a155-4a0c-a023-9aef7bcbfd65/GSoC-testfile.mp4")
        }]).output(outputVideoFileName).concat()
        .then((outputFileName) => {
            console.log(outputFileName);
            res.json({
                "status": "ok",
                "message": "Merged All Video Successfully",
                "video_file_path": outputFileName.replaceAll("\\", "/")
            });
        }).catch((err) => {
            console.log(err);
        });

})


router.route("/download_file").get((req, res) => {
    // (query-string)
    // file_path=public/upload/5214c459-47d5-434f-8c25-cce3a5f47ff7.mp4


    // file will start downloading  res.json(null);
    res.sendFile(path.resolve(req.query.file_path));
})
export default router;