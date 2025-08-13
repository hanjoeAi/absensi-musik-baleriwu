document.addEventListener("DOMContentLoaded", () => {
    // ########## PENGATURAN ##########
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz5mnZ54X-J_VJZnXg-CUix4MopWBmJwf_3XOWuUeYOMXtXw8abFFEXrSIhdLh0R6qucg/exec"; // GANTI DENGAN URL WEB APP ANDA
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

        if (filterKegiatan === 'Semua') {
            siswaTampil = semuaSiswa;
        } else if (filterKegiatan === 'Band') {
            if (filterBandId) {
                const anggotaIds = semuaAnggotaBand
                    .filter(anggota => anggota.bandId === filterBandId)
                    .map(anggota => anggota.siswaId);
                siswaTampil = semuaSiswa.filter(siswa => anggotaIds.includes(siswa.id));
            } else {
                 siswaTampil = []; // Jangan tampilkan siapa-siapa jika belum pilih band
            }
        } else {
            siswaTampil = semuaSiswa.filter(siswa => siswa.minat === filterKegiatan);
        }

        studentListEl.innerHTML = '';
        if (siswaTampil.length === 0) {
            studentListEl.innerHTML = '<p>Tidak ada siswa untuk kegiatan ini.</p>';
            return;
        }

        siswaTampil.sort((a, b) => a.nama.localeCompare(b.nama)).forEach(siswa => {
            const itemHTML = `
                <div class="list-item">
                    <span class="item-name">${siswa.nama} <small>(${siswa.minat || 'Belum ada minat'})</small></span>
                    <div class="item-actions">
                        <button class="btn-edit" data-id="${siswa.id}">✏️</button>
                        <button class="btn-delete" data-id="${siswa.id}">🗑️</button>
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

    // Fungsi mengirim data ke Google Apps Script
    async function postData(data) {
        showLoading();
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Penting untuk Apps Script Web App
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
             // Karena mode 'no-cors', kita tidak bisa membaca response. Jadi kita anggap sukses.
            // Untuk mendapatkan feedback, perlu trik redirect di Apps Script, tapi ini cukup untuk sekarang.
            alert("Operasi sedang diproses. Silakan cek spreadsheet untuk konfirmasi.");
            await loadInitialData(); // Muat ulang data
        } catch (error) {
            console.error('Error posting data:', error);
            alert('Terjadi kesalahan saat mengirim data.');
            hideLoading();
        }
    }


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
        const target = e.target;
        const nama = target.dataset.nama;
        const peran = target.dataset.peran;
        const idSiswa = target.dataset.id;

        if (target.classList.contains('btn-hadir')) {
            const tanggal = hariTanggalEl.value;
            if (!tanggal) {
                alert("Harap isi Hari & Tanggal terlebih dahulu!");
                return;
            }
            const payload = {
                action: "saveAttendance",
                tanggal: tanggal,
                kegiatan: jenisKegiatanEl.value === 'Band' ? `Band: ${pilihGrupBandEl.options[pilihGrupBandEl.selectedIndex].text}` : jenisKegiatanEl.value,
                nama: nama,
                peran: peran,
                status: "Hadir",
                keterangan: ""
            };
            await postData(payload);
        } else if (target.classList.contains('btn-tidak-hadir')) {
            dataAbsenSementara = { nama, peran };
            namaTidakHadirEl.textContent = `Nama: ${nama}`;
            modalKeterangan.style.display = 'block';
        } else if (target.classList.contains('btn-edit')) {
            const siswa = semuaSiswa.find(s => s.id === idSiswa);
            if(siswa) {
                modalSiswaTitle.textContent = "Edit Data Siswa";
                editSiswaId.value = siswa.id;
                inputNamaSiswa.value = siswa.nama;
                inputMinatSiswa.value = siswa.minat;
                modalSiswa.style.display = "block";
            }
        } else if (target.classList.contains('btn-delete')) {
            if (confirm(`Apakah Anda yakin ingin menghapus siswa "${nama}"?`)) {
                await postData({ action: 'deleteStudent', id: idSiswa });
            }
        }
    });

    // Simpan keterangan tidak hadir
    btnSimpanKeterangan.addEventListener('click', async () => {
        const tanggal = hariTanggalEl.value;
        if (!tanggal) {
            alert("Harap isi Hari & Tanggal terlebih dahulu!");
            return;
        }
        const statusSingkat = pilihanKeteranganEl.value;
        const keteranganLengkap = inputKeteranganEl.value.trim();
        
        const payload = {
            action: "saveAttendance",
            tanggal: tanggal,
            kegiatan: jenisKegiatanEl.value === 'Band' ? `Band: ${pilihGrupBandEl.options[pilihGrupBandEl.selectedIndex].text}` : jenisKegiatanEl.value,
            nama: dataAbsenSementara.nama,
            peran: dataAbsenSementara.peran,
            status: statusSingkat,
            keterangan: keteranganLengkap
        };

        await postData(payload);
        closeAllModals();
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
});
          
