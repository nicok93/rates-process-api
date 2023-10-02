import fsSync from 'fs';
import fs from 'fs/promises';
import path from 'path';

async function takeSnapshot(entityName, entities) {
    const snapshotsPath = path.resolve('snapshots');
    if (!fsSync.existsSync(snapshotsPath)) {
        fsSync.mkdirSync(snapshotsPath);
    }
    const filePath = snapshotsPath + "/" + entityName + ".json";
    await fs.writeFile(filePath, JSON.stringify(entities));
    return filePath;
}

function pathExists(entityName) {
    const snapshotsPath = path.resolve('snapshots') + "/" + entityName + ".json";
    const exists = fsSync.existsSync(snapshotsPath);
    return exists;
}

async function readFile(entityName, id, filterFunction) {
    const snapshotsPath = path.resolve('snapshots') + "/" + entityName + ".json";
    let file = JSON.parse(await fs.readFile(snapshotsPath, { encoding: 'utf8' }));
    if (id != null) {
        file = (file.filter(element => filterFunction(element, id)))[0] ?? null;
    }
    return file;
}

export default { takeSnapshot, pathExists, readFile }