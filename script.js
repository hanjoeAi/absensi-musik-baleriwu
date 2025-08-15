document.addEventListener("DOMContentLoaded", () => {
    // ########## PENGATURAN ##########
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxG_CSOxn7i6BSvRHSqwbllxEFUTyjwrMQJvsPOp63-4RHgpnoc8-lbIRcWVp2o1ubTkg/exec"; // GANTI DENGAN URL WEB APP ANDA
    const PELATIH_PENDAMPING = [
        { nama: "Hendrikus Y. Mori", peran: "Pelatih" },
        { nama: "Benediktus Budi", peran: "Pendamping 1" },
        { nama: "Joni Pareira", peran: "Pendamping 2" }
    ];

    // ########## ELEMEN DOM ##########
    const hariTanggalEl = document.getElementById("hari-tanggal");
    const jenisKegiatanEl = document.getElementById("jenis-kegiatan");
    const pilihGrupBandEl = document.getElementById("pilih-grup-band");
    const grupBandContainer = document.getElementById("grup-band-container");
    const coachListEl = document.getElementById("coach-list");
    const studentListEl = document.getElementById("student-list");
    // ... elemen-elemen lain
    const btnSavePdf = document.getElementById("btn-save-pdf");

    // Tombol Aksi
    const btnTambahSiswa = document.getElementById("btn-tambah-siswa");
    const btnTambahGrup = document.getElementById("btn-tambah-grup");

    // Modal Siswa
    const modalSiswa = document.getElementById("modal-siswa");
    const modalSiswaTitle = document.getElementById("modal-siswa-title");
    const editSiswaId = document.getElementById("edit-siswa-id");
    const inputNamaSiswa = document.getElementById("input-nama-siswa");
    const inputMinatSiswa = document.getElementById("input-minat-siswa");
    const btnSimpanSiswa = document.getElementById("btn-simpan-siswa");
    
    // Modal Keterangan
    const modalKeterangan = document.getElementById("modal-keterangan");
    const namaTidakHadirEl = document.getElementById("nama-tidak-hadir");
    const pilihanKeteranganEl = document.getElementById("pilihan-keterangan");
    const inputKeteranganEl = document.getElementById("input-keterangan");
    const btnSimpanKeterangan = document.getElementById("btn-simpan-keterangan");

    // Modal Tambah Grup Band
    const modalGrupBand = document.getElementById("modal-grup-band");
    const inputNamaBand = document.getElementById("input-nama-band");
    const btnSimpanGrupBand = document.getElementById("btn-simpan-grup-band");

    // Modal Tambah Anggota Band
    const modalAnggotaBand = document.getElementById("modal-anggota-band");
    const modalAnggotaTitle = document.getElementById("modal-anggota-title");
    const bandIdForMember = document.getElementById("band-id-for-member");
    const pilihSiswaUntukBandEl = document.getElementById("pilih-siswa-untuk-band");
    const btnSimpanAnggotaBand = document.getElementById("btn-simpan-anggota-band");

    // ########## STATE APLIKASI ##########
    let semuaSiswa = [];
    let semuaKegiatan = [];
    let semuaGrupBand = [];
    let semuaAnggotaBand = [];
    let dataAbsenSementara = {};

    // ########## FUNGSI UTAMA ##########

    // Fungsi untuk memuat data awal dari Google Sheet
    async function loadInitialData() {
        showLoading();
        try {
            const response = await fetch(`${SCRIPT_URL}?action=getInitialData`);
            const data = await response.json();
            semuaSiswa = data.siswa.filter(s => s.status === 'Aktif');
            semuaKegiatan = data.kegiatan;
            semuaGrupBand = data.grupBand;
            semuaAnggotaBand = data.anggotaBand;
            
            renderCoachList();
            renderStudentList();
            populateKegiatanDropdown();
            populateGrupBandDropdown();
            hideLoading();
        } catch (error) {
            console.error("Error loading initial data:", error);
            alert("Gagal memuat data. Cek koneksi dan URL Apps Script.");
            hideLoading();
        }
    }

    // Fungsi untuk merender daftar Pelatih & Pendamping
    function renderCoachList() {
        coachListEl.innerHTML = '';
        PELATIH_PENDAMPING.forEach(p => {
            const itemHTML = `
                <div class="list-item">
                    <span class="item-name">${p.nama} (${p.peran})</span>
                    <div class="item-actions">
                        <button class="btn-hadir" data-nama="${p.nama}" data-peran="${p.peran}">HADIR</button>
                        <button class="btn-tidak-hadir" data-nama="${p.nama}" data-peran="${p.peran}">TIDAK HADIR</button>
                    </div>
                </div>
            `;
            coachListEl.insertAdjacentHTML('beforeend', itemHTML);
        });
    }

    // Fungsi untuk merender daftar siswa berdasarkan filter
function renderStudentList() {
    studentListEl.innerHTML = '<p>Memuat siswa...</p>';
    const filterKegiatan = jenisKegiatanEl.value;
    const filterBandId = pilihGrupBandEl.value;
    
    let siswaTampil = [];

    // Logika filter biarkan sama
    if (filterKegiatan === 'Semua') {
        siswaTampil = semuaSiswa;
    } else if (filterKegiatan === 'Band') {
        if (filterBandId) {
            const anggotaIds = semuaAnggotaBand
                .filter(anggota => anggota.bandId === filterBandId)
                .map(anggota => anggota.siswaId);
            siswaTampil = semuaSiswa.filter(siswa => anggotaIds.includes(siswa.id));
        } else {
            siswaTampil = [];
        }
    } else {
        siswaTampil = semuaSiswa.filter(siswa => siswa.minat === filterKegiatan);
    }

    studentListEl.innerHTML = '';
    if (siswaTampil.length === 0) {
        studentListEl.innerHTML = '<p>Tidak ada siswa untuk kegiatan ini.</p>';
        return;
    }

    // Loop dan buat HTML untuk setiap siswa
    siswaTampil.sort((a, b) => a.nama.localeCompare(b.nama)).forEach(siswa => {
        // Cari tahu apakah siswa ini ada di grup band
        const bandInfo = semuaAnggotaBand.find(anggota => anggota.siswaId === siswa.id);
        let namaBand = '';
        if (bandInfo) {
            const band = semuaGrupBand.find(b => b.id === bandInfo.bandId);
            if (band) namaBand = band.nama;
        }

        const itemHTML = `
            <div class="list-item" data-id-siswa="${siswa.id}">
                <div>
                    <span class="item-name">${siswa.nama}</span>
                    <span class="student-details">
                        Minat: ${siswa.minat || 'N/A'} | Band: ${namaBand || 'N/A'}
                    </span>
                </div>
                <div class="item-actions">
                    <button class="btn-edit" title="Edit Siswa">✏️</button>
                    <button class="btn-delete" title="Hapus Siswa">🗑️</button>
                    <button class="btn-hadir" data-nama="${siswa.nama}" data-peran="Siswa">HADIR</button>
                    <button class="btn-tidak-hadir" data-nama="${siswa.nama}" data-peran="Siswa">TIDAK HADIR</button>
                </div>
            </div>
        `;
        studentListEl.insertAdjacentHTML('beforeend', itemHTML);
    });
}

    // Mengisi dropdown kegiatan
    function populateKegiatanDropdown() {
        // Hapus opsi lama kecuali "Semua"
        [...jenisKegiatanEl.options].forEach(option => {
            if (option.value !== 'Semua') option.remove();
        });

        semuaKegiatan.forEach(kegiatan => {
            if (kegiatan) { // Pastikan bukan string kosong
                 const option = new Option(kegiatan, kegiatan);
                 jenisKegiatanEl.add(option);
            }
        });
    }

     // Mengisi dropdown grup band
    function populateGrupBandDropdown() {
        pilihGrupBandEl.innerHTML = '<option value="">-- Pilih Band --</option>';
        semuaGrupBand.forEach(band => {
            const option = new Option(band.nama, band.id);
            pilihGrupBandEl.add(option);
        });
    }

    // Simpan siswa (tambah atau edit)
btnSimpanSiswa.addEventListener("click", async () => {
    const id = editSiswaId.value;
    const nama = inputNamaSiswa.value.trim();
    const minat = inputMinatSiswa.value;

    if (!nama || !minat) {
        alert("Nama dan Minat harus diisi!");
        return;
    }

    const action = id ? "editStudent" : "addStudent";
    const payload = { action, nama, minat, id };

    closeAllModals(); // Tutup modal dulu
    await postData(payload); // Kirim data
});

// Simpan keterangan tidak hadir
btnSimpanKeterangan.addEventListener('click', async () => {
    const tanggal = hariTanggalEl.value;
    if (!tanggal) { alert("Harap isi Hari & Tanggal terlebih dahulu!"); return; }
    
    const statusSingkat = pilihanKeteranganEl.value;
    const keteranganLengkap = inputKeteranganEl.value.trim();
    
    const payload = {
        action: "saveAttendance", tanggal, kegiatan: jenisKegiatanEl.value,
        nama: dataAbsenSementara.nama, peran: dataAbsenSementara.peran,
        status: statusSingkat, keterangan: keteranganLengkap
    };

    // Warnai item setelah absen
    if(dataAbsenSementara.listItem) {
      dataAbsenSementara.listItem.style.backgroundColor = '#f8d7da';
    }

    closeAllModals();
    await postData(payload);
    inputKeteranganEl.value = '';
});


    // ########## EVENT HANDLERS ##########

    // Filter siswa saat kegiatan diganti
    jenisKegiatanEl.addEventListener("change", () => {
        grupBandContainer.style.display = jenisKegiatanEl.value === 'Band' ? 'flex' : 'none';
        renderStudentList();
    });
    
    // Filter siswa saat grup band diganti
    pilihGrupBandEl.addEventListener("change", renderStudentList);

    // Buka modal tambah siswa
    btnTambahSiswa.addEventListener("click", () => {
        modalSiswaTitle.textContent = "Tambah Siswa Baru";
        editSiswaId.value = '';
        inputNamaSiswa.value = '';
        inputMinatSiswa.value = '';
        modalSiswa.style.display = "block";
    });

    // Simpan siswa (tambah atau edit)
    btnSimpanSiswa.addEventListener("click", async () => {
        const id = editSiswaId.value;
        const nama = inputNamaSiswa.value.trim();
        const minat = inputMinatSiswa.value;

        if (!nama || !minat) {
            alert("Nama dan Minat harus diisi!");
            return;
        }

        const action = id ? "editStudent" : "addStudent";
        const payload = { action, nama, minat, id };

        await postData(payload);
        closeAllModals();
    });
    
    // Aksi di daftar absensi (hadir, tidak hadir, edit, hapus)
document.getElementById('attendance-list').addEventListener('click', async (e) => {
    // Cari elemen .list-item terdekat dari tombol yang diklik
    const listItem = e.target.closest('.list-item');
    if (!listItem) return; // Jika yang diklik bukan di dalam list-item, abaikan

    const idSiswa = listItem.dataset.idSiswa;
    const siswa = semuaSiswa.find(s => s.id === idSiswa);

    // Jika tombol EDIT yang diklik
    if (e.target.classList.contains('btn-edit')) {
        if (siswa) {
            modalSiswaTitle.textContent = "Edit Data Siswa";
            editSiswaId.value = siswa.id;
            inputNamaSiswa.value = siswa.nama;
            inputMinatSiswa.value = siswa.minat;
            modalSiswa.style.display = "block";
        }
    } 
    // Jika tombol HAPUS yang diklik
    else if (e.target.classList.contains('btn-delete')) {
        if (siswa && confirm(`Apakah Anda yakin ingin menghapus siswa "${siswa.nama}"?`)) {
            await postData({ action: 'deleteStudent', id: siswa.id });
        }
    } 
    // Jika tombol HADIR yang diklik
    else if (e.target.classList.contains('btn-hadir')) {
        const nama = e.target.dataset.nama;
        const peran = e.target.dataset.peran;
        const tanggal = hariTanggalEl.value;
        if (!tanggal) {
            alert("Harap isi Hari & Tanggal terlebih dahulu!");
            return;
        }
        const payload = {
            action: "saveAttendance", tanggal, kegiatan: jenisKegiatanEl.value, nama, peran, status: "Hadir", keterangan: ""
        };
        await postData(payload);
        // Tambahkan efek visual setelah absen
        listItem.style.backgroundColor = '#d4edda';
    } 
    // Jika tombol TIDAK HADIR yang diklik
    else if (e.target.classList.contains('btn-tidak-hadir')) {
        const nama = e.target.dataset.nama;
        const peran = e.target.dataset.peran;
        dataAbsenSementara = { nama, peran, listItem }; // Simpan listItem untuk diwarnai nanti
        namaTidakHadirEl.textContent = `Nama: ${nama}`;
        modalKeterangan.style.display = 'block';
    }
});

    // Simpan siswa (tambah atau edit)
btnSimpanSiswa.addEventListener("click", async () => {
    const id = editSiswaId.value;
    const nama = inputNamaSiswa.value.trim();
    const minat = inputMinatSiswa.value;

    if (!nama || !minat) {
        alert("Nama dan Minat harus diisi!");
        return;
    }

    const action = id ? "editStudent" : "addStudent";
    const payload = { action, nama, minat, id };

    closeAllModals(); // Tutup modal dulu
    await postData(payload); // Kirim data
});

// Simpan keterangan tidak hadir
btnSimpanKeterangan.addEventListener('click', async () => {
    const tanggal = hariTanggalEl.value;
    if (!tanggal) { alert("Harap isi Hari & Tanggal terlebih dahulu!"); return; }
    
    const statusSingkat = pilihanKeteranganEl.value;
    const keteranganLengkap = inputKeteranganEl.value.trim();
    
    const payload = {
        action: "saveAttendance", tanggal, kegiatan: jenisKegiatanEl.value,
        nama: dataAbsenSementara.nama, peran: dataAbsenSementara.peran,
        status: statusSingkat, keterangan: keteranganLengkap
    };

    // Warnai item setelah absen
    if(dataAbsenSementara.listItem) {
      dataAbsenSementara.listItem.style.backgroundColor = '#f8d7da';
    }

    closeAllModals();
    await postData(payload);
    inputKeteranganEl.value = '';
});
    
     // Buka modal tambah grup band
    btnTambahGrup.addEventListener("click", () => {
        modalGrupBand.style.display = "block";
    });

    // Simpan grup band baru
    btnSimpanGrupBand.addEventListener("click", async () => {
        const namaBand = inputNamaBand.value.trim();
        if (!namaBand) {
            alert("Nama band tidak boleh kosong!");
            return;
        }
        await postData({ action: 'addBand', namaBand });
        inputNamaBand.value = '';
        closeAllModals();
    });


    // Menutup semua modal
    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    }

    document.querySelectorAll('.close-button').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    function showLoading() {
        // Bisa ditambahkan visual loading, untuk sekarang cukup log
        console.log("Loading...");
    }

    function hideLoading() {
        console.log("Loading complete.");
    }

    // ########## INISIALISASI ##########
    hariTanggalEl.valueAsDateTime = new Date(); // Set tanggal & waktu sekarang
    loadInitialData();

    // Event listener untuk tombol simpan PDF
btnSavePdf.addEventListener('click', () => {
    // Ambil elemen yang ingin kita cetak
    const printableArea = document.getElementById('printable-area');

    // Ambil tanggal hari ini untuk nama file
    const tanggal = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const fileName = `Absensi-Musik-${tanggal}.pdf`;

    // Gunakan html2canvas untuk mengambil 'screenshot' dari area cetak
    html2canvas(printableArea, { scale: 2 }).then(canvas => { // scale: 2 untuk resolusi lebih baik
        const imgData = canvas.toDataURL('image/png');

        // Inisialisasi jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Hitung dimensi gambar agar pas di halaman A4
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // Tambahkan gambar ke PDF
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        // Simpan PDF
        pdf.save(fileName);
    });
});
});
          
