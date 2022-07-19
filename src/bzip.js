import file_system from "fs";
import archiver from "archiver";

async function CreateZipFile(mode) {
  file_system.createReadStream(`.env`).pipe(file_system.createWriteStream(`dist/${mode}/.env`));
  file_system.createReadStream(`ormconfig.json`).pipe(file_system.createWriteStream(`dist/${mode}/ormconfig.json`));
  file_system.createReadStream(`package.json`).pipe(file_system.createWriteStream(`dist/${mode}/package.json`));
  const output = file_system.createWriteStream(`dist/${mode}.zip`);
  const archive = archiver("zip");

  output.on("close", function () {
    console.log(archive.pointer() + " total bytes");
    console.log("archiver has been finalized and the output file descriptor has closed.");
  });

  archive.on("error", function (err) {
    throw err;
  });

  archive.pipe(output);

  //// append files from a sub-directory, putting its contents at the root of archive
  archive.directory(`dist/${mode}`, false);

  //// append files from a sub-directory and naming it `new-subdir` within the archive
  //   archive.directory(`dist/${mode}`, "new-subdir");

  archive.finalize();
}

const argvs = process.argv[process.argv.length - 1].split("--");
const run_mode = argvs[1];
CreateZipFile(run_mode);
