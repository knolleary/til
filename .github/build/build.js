const Git = require("nodegit");
const fs = require('fs');
const readline = require('readline');

async function getFirstLine(pathToFile) {
    if (fs.existsSync(pathToFile)) {
        const readable = fs.createReadStream(pathToFile);
        const reader = readline.createInterface({ input: readable });
        const line = await new Promise((resolve,reject) => {
            reader.on('line', (line) => {
                reader.close();
                resolve(line);
            });
        });
        readable.close();
        return line;
    }
}

async function getFileHistory() {
    return Git.Repository.open(__dirname+"/../..").then(async function(repo) {
        const files = {};
        const revwalk = Git.Revwalk.create(repo);
        revwalk.reset();
        revwalk.sorting(Git.Revwalk.SORT.TIME , Git.Revwalk.SORT.REVERSE);
        const headCommit = await repo.getBranchCommit("main");
        revwalk.push(headCommit.sha());
        // step through all OIDs for the given reference
        let hasNext = true;
        while (hasNext) {
            try {
                const oid = await revwalk.next();
                if (oid) {
                    const commit = await repo.getCommit(oid);
                    const diffs = await commit.getDiff();
                    for (let i=0,l=diffs.length; i<l; i++) {
                        const patches = await diffs[i].patches();
                        for (patch of patches) {
                            const filePath = patch.newFile().path();
                            if (files[filePath]) {
                                files[filePath].updated = commit.date();
                            } else {
                                files[filePath] = {
                                    created: commit.date()
                                }
                            }
                        }
                    };
                }
            } catch (err) {
                hasNext = false;
            }
        }
        return files;
    })
}
function sanitize(str) {
     return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

(async function() {
    const lines = [];
    let count = 0;
    const files = await getFileHistory();
    const fileNames = Object.keys(files).filter(fn => /^[^./]+\/[^/]+.+\.md/.test(fn));
    fileNames.sort();
    let currentTopic = null;
    let l = fileNames.length;
    for (let i=0;i<l;i++) {
        let fn = fileNames[i];
        let [topic,file] = fn.split("/");
        let title = await getFirstLine(__dirname+"/../../"+fn);
        if (title) {
            title = title.replace(/^# */,"")
            if (topic != currentTopic) {
                lines.push(`\n## ${topic}`)
                currentTopic = topic;
            }
            count++;
            const date = new Date(files[fn].updated||files[fn].created)
            lines.push(` - [${sanitize(title)}](${fn}) - ${date.toISOString().substring(0,10)}`)
        }
    }
    const things = lines.join("\n");

    let readme = fs.readFileSync(__dirname+"/../../README.md","utf-8");
    readme = readme.replace(/<!-- CS -->[\s\S]*<!-- CE -->/m,`<!-- CS -->${count}<!-- CE -->`);
    readme = readme.replace(/<!-- TS -->[\s\S]*<!-- TE -->/m,`<!-- TS -->\n\n${things}\n\n<!-- TE -->`);
    fs.writeFileSync(__dirname+"/../../README.md",readme)
})();
