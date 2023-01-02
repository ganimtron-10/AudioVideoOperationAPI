import express from "express";
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.route("/").get((req, res) => {
    res.send("HomePage");
})

router.route("/create_new_storage").post((req, res) => {

    if (req.cookies.token == null) {
        res.cookie("token", uuidv4(), {
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

router.route("/upload_file").post((req, res) => {

    // (form-data)
    // my_file  : {{Your_file}}


    res.json({
        "status": "ok",
        "file_path": "public/upload/6bc5277a-b3ac-477e-b71d-998c156bc0da.txt"
    });
})

router.route("/my_upload_file").get((req, res) => {


    res.json({
        "status": "ok",
        "data": [
            "9c5ff995-23c0-418a-8ed4-a5da9c10fd37-10fcfc4e-fa8e-404a-bfdd-422f68beb2a2.png",
            "9c5ff995-23c0-418a-8ed4-a5da9c10fd37-f8b34592-3c46-456d-9d86-26de6e6daa35.txt"
        ]
    }
    );
})

router.route("/text_file_to_audio").post((req, res) => {

    // (json)
    //  {
    // "file_path": "public/upload/6bc5277a-b3ac-477e-b71d-998c156bc0da.txt"
    //    }

    res.json({
        "status": "ok",
        "message": "text to speech converted",
        "audio_file_path": "public/upload/4839379a-4d0a-440e-943f-e1e4b0ebfdb7.mp3"
    });
})


router.route("/merge_image_and_audio").post((req, res) => {

    // (json)
    // {
    //  "image_file_path": "public/upload/20a4dc79-dc67-43c9-b61c-a0e4aceb3de7.jpg" ,
    //  "audio_file_path": "public/upload/4839379a-4d0a-440e-943f-e1e4b0ebfdb7.mp3"
    //   }    

    res.json(
        {
            "status": "ok",
            "message": "Video Created Successfully",
            "video_file_path": "public/upload/e88c28f8-9da0-4fd8-9e56-41712e24868d_voice.mp4"
        }

    );
})

router.route("/merge_video_and_audio").post((req, res) => {

    //     (json)
    //   {
    //    "video_file_path":"public/upload/893adf65-9c49-4d74-9add-36ca23c6361c.mp4", 
    //     "audio_file_path": "public/upload/4839379a-4d0a-440e-943f-e1e4b0ebfdb7.mp3"
    //   }

    res.json({
        "status": "ok",
        "message": "Video and Audio Merged Successfully",
        "video_file_path": "public/upload/d9141df7-557d-4862-ae28-7d72909ca78b.mp4"
    }
    );
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


    res.json({
        "status": "ok",
        "message": "Merged All Video Successfully",
        "video_file_path": "public/upload/4a1ef1cd-7ec9-4ffc-bb8b-e8f0ccac341c.mp4"
    }
    );
})


router.route("/download_file").get((req, res) => {
    // (query-string)
    // file_path=public/upload/5214c459-47d5-434f-8c25-cce3a5f47ff7.mp4


    // file will start downloading  res.json(null);
})
export default router;