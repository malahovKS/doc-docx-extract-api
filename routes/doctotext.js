import log from "../libs/log";
import multer from "multer";
import fs from "fs";
import * as CATDOC from "child_process";
import commandExists from "command-exists";

const UPLOADDOC = multer({dest: 'public/uploads/doc/'}).single('doc');

module.exports = app => {

	app.post("/api/doctotext", UPLOADDOC, (req, res) => {

		log.debug(req.headers);

		if (req.file.originalname.toLowerCase().indexOf(".doc") === -1) {
			res.status(400).send("Wrong file type");
			fs.unlink(req.file.path);
			return log.error("400 Error: File upload only supports .doc file type");
		}

		commandExists('catdoc')
			.then(() => {
				CATDOC.exec("catdoc -d utf-8 " + req.file.path, {maxBuffer: 3000 * 1024},
					(error, stdout, stderr) => {

						if (error) {
							fs.unlink(req.file.path);
							res.sendStatus(500);
							log.error(error);
							return log.error(stderr);
						}

						log.debug(req.file.originalname + " Done!");
						log.debug("\n" + stdout);

						fs.unlink(req.file.path);
						res.type('text/plain');
						res.status(200).send(stdout.trim());
						res.flush();

					})
			}).catch(() => {
			fs.unlink(req.file.path);
			res.sendStatus(500);
			return log.error("500 Error: Command catdoc doesn't exist");
		});

	});
};