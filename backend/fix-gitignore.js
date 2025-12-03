import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const fixGitIgnore = () => {
    console.log("🔧 Starting .gitignore Fixer...");

    const gitignorePath = path.resolve('.gitignore');
    
    // 1. Force-write a clean, UTF-8 encoded .gitignore file
    // We add common system files and node_modules
    const content = `node_modules\n.env\n.DS_Store\n`;
    
    try {
        fs.writeFileSync(gitignorePath, content, { encoding: 'utf8' });
        console.log("✅ Created a clean .gitignore file (UTF-8).");
    } catch (e) {
        console.error("❌ Failed to write .gitignore:", e);
        return;
    }

    // 2. Clear Git cache for node_modules
    try {
        console.log("🧹 Clearing Git cache for node_modules...");
        // We use 'catch' here because if the folder isn't in git, this command throws an error, which is fine.
        try {
            execSync('git rm -r --cached node_modules', { stdio: 'ignore' });
        } catch (e) {
            // Ignore error if file wasn't tracked
        }
        console.log("✅ Cache cleared.");
    } catch (e) {
        console.error("❌ Error clearing cache:", e);
    }

    console.log("\n🎉 DONE! Now run 'git status' in your terminal.");
    console.log("   You should see .gitignore listed, but NOT node_modules.");
};

fixGitIgnore();