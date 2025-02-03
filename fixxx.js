// **Tutorial Penggunaan**
//
// **Persyaratan:**
// 1. Pastikan Anda memiliki Node.js terinstal di sistem Anda.
// 2. Pastikan Anda memiliki akun GitHub dan sudah membuat Personal Access Token (PAT).
// 3. Ganti `your_github_token` dan `your_github_username` dengan kredensial GitHub Anda.
//
// **Instalasi Modul yang Diperlukan:**
// Jalankan perintah berikut untuk menginstal semua dependensi yang dibutuhkan:
// ```
// npm install jsonfile moment simple-git random axios readline-sync
// ```
//
// **Menjalankan Program:**
// Jalankan perintah berikut di terminal:
// ```
// node nama_file.js
// ```
//
// **Cara Menggunakan:**
// 1. Saat dijalankan, program akan meminta Anda memilih antara:
//    - `1. Add Repository` → Untuk membuat dan mengupload repository ke GitHub.
//    - `2. Add Contributions` → Untuk menambahkan kontribusi dalam riwayat Git.
// 2. Jika memilih `Add Repository`, masukkan nama dasar repository dan jumlah repository yang ingin dibuat.
// 3. Jika memilih `Add Contributions`, masukkan jumlah kontribusi yang ingin ditambahkan.

import simpleGit from "simple-git";
import axios from "axios";
import fs from "fs";
import readline from "readline";

const GITHUB_TOKEN = ""; // Isi dengan token GitHub Anda
const GITHUB_USERNAME = ""; // Isi dengan username GitHub Anda
const GITHUB_API_URL = `https://api.github.com/user/repos`;

async function createRepo(repoName) {
  try {
    await axios.post(
      GITHUB_API_URL,
      {
        name: repoName,
        private: false,
        description: `Repository for ${repoName}`,
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    console.log(`Repository created on GitHub: ${repoName}`);
  } catch (error) {
    console.error(
      `Failed to create repository: ${repoName}`,
      error.response?.data?.message || error.message
    );
  }
}

async function initializeAndPushRepo(repoName) {
  try {
    const sanitizedRepoName = repoName.replace(/\s+/g, "-");
    const repoPath = `./${sanitizedRepoName}`;
    const remoteURL = `https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${sanitizedRepoName}.git`;

    // Create directory
    if (!fs.existsSync(repoPath)) {
      fs.mkdirSync(repoPath);
    }

    const git = simpleGit(repoPath);
    
    // Initialize repository
    await git.init();

    // Create files
    const readmeContent = `# ${sanitizedRepoName}\n\nA repository with sample website files`;
    fs.writeFileSync(`${repoPath}/README.md`, readmeContent);

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>${sanitizedRepoName}</title>
    <link rel="stylesheet" type="text/css" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to ${sanitizedRepoName}</h1>
        <p>Automatically generated repository</p>
    </div>
</body>
</html>`;
    fs.writeFileSync(`${repoPath}/index.html`, htmlContent);

    const cssContent = `.container {
    max-width: 800px;
    margin: 50px auto;
    text-align: center;
    font-family: Arial, sans-serif;
}

h1 {
    color: #2c3e50;
}

p {
    color: #7f8c8d;
}`;
    fs.writeFileSync(`${repoPath}/styles.css`, cssContent);

    // Git operations
    await git.add(["."]);
    await git.commit("Initial commit with website files");
    await git.addRemote("origin", remoteURL);
    await git.branch(["-M", "main"]);
    await git.push("origin", "main");

    console.log(`Successfully pushed: ${repoName}\n`);
  } catch (error) {
    console.error(
      `Error pushing repository: ${repoName}`,
      error.message
    );
  }
}

async function createMultipleRepos(baseName, count) {
  for (let i = 1; i <= count; i++) {
    const repoName = `${baseName}-${i}`;
    await createRepo(repoName);
    await initializeAndPushRepo(repoName);
  }
}

function promptUser() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Masukkan nama dasar repository: ", (baseName) => {
    if (!baseName.trim()) {
      console.error("Nama tidak boleh kosong!");
      rl.close();
      return;
    }

    rl.question("Masukkan jumlah repository yang ingin dibuat: ", async (count) => {
      const repoCount = parseInt(count);
      if (isNaN(repoCount) || repoCount <= 0) {
        console.error("Masukkan angka yang valid!");
        rl.close();
        return;
      }

      console.log("\nMulai membuat repository...\n");
      await createMultipleRepos(baseName.trim(), repoCount);
      console.log("\nProses selesai!");
      rl.close();
    });
  });
}

// Jalankan program
promptUser();
