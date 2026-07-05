document.addEventListener('DOMContentLoaded', function() {
    const inputTarget = document.getElementById('input-target');
    const previewTitle = document.getElementById('preview-title');
    const btnPublish = document.getElementById('btn-publish');
    
    const inputFoto = document.getElementById('input-foto');
    const infoFoto = document.getElementById('info-foto');
    const inputMusik = document.getElementById('input-musik');
    const infoMusik = document.getElementById('info-musik');

    let listFotoBase64 = [];
    let musikBase64 = "";

    // Live preview nama penerima
    inputTarget.addEventListener('input', function(e) {
        const value = e.target.value.trim();
        previewTitle.textContent = value ? `HADIAH BUAT ${value.toUpperCase()}` : 'HADIAH BUAT ...';
    });

    // Fungsi membaca file tunggal menjadi Base64
    const fileToText = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    // Event ketika foto dipilih
    inputFoto.addEventListener('change', async function() {
        listFotoBase64 = [];
        const files = Array.from(inputFoto.files).slice(0, 4); // Ambil maksimal 4 foto saja agar link tidak terlalu panjang
        
        for (let file of files) {
            const base64 = await fileToText(file);
            listFotoBase64.push(base64);
        }
        infoFoto.textContent = `${listFotoBase64.length}/4`;
        infoFoto.className = "counter";
    });

    // Event ketika musik dipilih
    inputMusik.addEventListener('change', async function() {
        if (inputMusik.files.length > 0) {
            const file = inputMusik.files[0];
            // Batasi ukuran lagu maksimal sekitar 3-4MB agar lancar
            if (file.size > 4500000) {
                alert("Ukuran file musik terlalu besar! Gunakan file mp3 di bawah 4MB.");
                inputMusik.value = "";
                return;
            }
            musikBase64 = await fileToText(file);
            infoMusik.textContent = "Tersedia";
            infoMusik.className = "counter";
        }
    });

    // Membuat link data akhir saat tombol diklik
    btnPublish.addEventListener('click', function() {
        const targetName = inputTarget.value.trim();
        const template = document.getElementById('input-template').value;
        const surat = document.getElementById('input-surat').value.trim();

        if (!targetName) {
            alert('Masukkan nama penerima kado terlebih dahulu!');
            return;
        }

        btnPublish.textContent = "MEMPROSES DATA...";
        btnPublish.disabled = true;

        // Susun objek data kado
        const kadoData = {
            n: targetName,
            t: template,
            s: surat || "Selamat hari istimewa!",
            f: listFotoBase64, // Menyimpan array foto base64
            m: musikBase64    // Menyimpan string lagu base64
        };

        try {
            const jsonString = JSON.stringify(kadoData);
            // Mengompres string unicode agar aman dibaca sebagai URL parameter
            const encodedData = btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, function(match, p1) {
                return String.fromCharCode('0x' + p1);
            }));

            const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
            const linkKadoAkhir = `${baseUrl}kado.html?data=${encodedData}`;

            alert(`🎉 BERHASIL!\n\nLink kado sudah disalin otomatis ke papan klip HP-mu. Tinggal kirim lewat WhatsApp!`);
            navigator.clipboard.writeText(linkKadoAkhir);
            
        } catch (err) {
            alert("Gagal memproses link kado. Pastikan ukuran foto dan musik yang kamu upload tidak terlalu besar.");
            console.error(err);
        } finally {
            btnPublish.textContent = "DAPATKAN LINK →";
            btnPublish.disabled = false;
        }
    });
});
