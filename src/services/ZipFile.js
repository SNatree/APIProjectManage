import file_system from "fs";
import archiver from "archiver";
import extract from "extract-zip";
import path from "path";

export const ZipFile = async ({ sourcePath = "", targetPath = "", dirName = "", rename = undefined } = {}) => {
  try {
    if (dirName === undefined || dirName === "") return false;
    const _target_path = path.join(targetPath, rename || dirName);
    const output = file_system.createWriteStream(`${_target_path}.zip`);
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
    const _source_path = path.join(sourcePath, dirName);
    archive.directory(`${_source_path}`, false);

    archive.finalize();
    return true;
  } catch (error) {}
  return false;
};

export const ExtractZipFile = async ({ filePath = "", targetPath = "", } = {}) => {
  try {
    await extract(`${filePath}`, { dir: targetPath });
    return true;
  } catch (error) {
    console.log('error :>> ', error);
  }
  return false;
};
