document.addEventListener("DOMContentLoaded", () => {
    // ########## PENGATURAN ##########
    [cite_start]const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxG_CSOxn7i6BSvRHSqwbllxEFUTyjwrMQJvsPOp63-4RHgpnoc8-lbIRcWVp2o1ubTkg/exec"; // GANTI DENGAN URL WEB APP ANDA [cite: 1]
    const PELATIH_PENDAMPING = [
        { nama: "Hendrikus Y. Mori", peran: "Pelatih" },
        { nama: "Benediktus Budi", peran: "Pendamping 1" },
        { nama: "Joni Pareira", peran: "Pendamping 2" }
    [cite_start]]; [cite: 1]

    // ########## ELEMEN DOM ##########
    const hariTanggalEl = document.getElementById("hari-tanggal");
    [cite_start]const jenisKegiatanEl = document.getElementById("jenis-kegiatan"); [cite: 2]
    [cite_start]const pilihGrupBandEl = document.getElementById("pilih-grup-band"); [cite: 2]
    [cite_start]const grupBandContainer = document.getElementById("grup-band-container"); [cite: 2]
    [cite_start]const coachListEl = document.getElementById("coach-list"); [cite: 2]
    [cite_start]const studentListEl = document.getElementById("student-list"); [cite: 2]
    [cite_start]const btnSavePdf = document.getElementById("btn-save-pdf"); [cite: 2]
    [cite_start]const btnTambahSiswa = document.getElementById("btn-tambah-siswa"); [cite: 3]
    [cite_start]const btnTambahGrup = document.getElementById("btn-tambah-grup"); [cite: 3]
    [cite_start]const modalSiswa = document.getElementById("modal-siswa"); [cite: 4]
    [cite_start]const modalSiswaTitle = document.getElementById("modal-siswa-title"); [cite: 4]
    [cite_start]const editSiswaId = document.getElementById("edit-siswa-id"); [cite: 4]
    [cite_start]const inputNamaSiswa = document.getElementById("input-nama-siswa"); [cite: 5]
    [cite_start]const inputMinatSiswa = document.getElementById("input-minat-siswa"); [cite: 5]
    [cite_start]const btnSimpanSiswa = document.getElementById("btn-simpan-siswa"); [cite: 5]
    [cite_start]const modalKeterangan = document.getElementById("modal-keterangan"); [cite: 6]
    [cite_start]const namaTidakHadirEl = document.getElementById("nama-tidak-hadir"); [cite: 6]
    [cite_start]const pilihanKeteranganEl = document.getElementById("pilihan-keterangan"); [cite: 6]
    [cite_start]const inputKeteranganEl = document.getElementById("input-keterangan"); [cite: 7]
    [cite_start]const btnSimpanKeterangan = document.getElementById("btn-simpan-keterangan"); [cite: 7]
    [cite_start]const modalGrupBand = document.getElementById("modal-grup-band"); [cite: 7]
    [cite_start]const inputNamaBand = document.getElementById("input-nama-band"); [cite: 8]
    [cite_start]const btnSimpanGrupBand = document.getElementById("btn-simpan-grup-band"); [cite: 8]
    [cite_start]const modalAnggotaBand = document.getElementById("modal-anggota-band"); [cite: 8]
    [cite_start]const modalAnggotaTitle = document.getElementById("modal-anggota-title"); [cite: 9]
    [cite_start]const bandIdForMember = document.getElementById("band-id-for-member"); [cite: 9]
    [cite_start]const pilihSiswaUntukBandEl = document.getElementById("pilih-siswa-untuk-band"); [cite: 9]
    [cite_start]const btnSimpanAnggotaBand = document.getElementById("btn-simpan-anggota-band"); [cite: 9]

    // ########## STATE APLIKASI ##########
    [cite_start]let semuaSiswa = []; [cite: 10]
    [cite_start]let semuaKegiatan = []; [cite: 10]
    [cite_start]let semuaGrupBand = []; [cite: 10]
    [cite_start]let semuaAnggotaBand = []; [cite: 11]
    [cite_start]let dataAbsenSementara = {}; [cite: 11]

    // ########## FUNGSI UTAMA ##########
    async function loadInitialData() {
        showLoading();
        try {
            [cite_start]const response = await fetch(`${SCRIPT_URL}?action=getInitialData`); [cite: 12]
            [cite_start]const data = await response.json(); [cite: 13]
            [cite_start]semuaSiswa = data.siswa.filter(s => s.status === 'Aktif'); [cite: 13]
            [cite_start]semuaKegiatan = data.kegiatan; [cite: 13]
            [cite_start]semuaGrupBand = data.grupBand; [cite: 13]
            [cite_start]semuaAnggotaBand = data.anggotaBand; [cite: 14]
            [cite_start]renderCoachList(); [cite: 14]
            [cite_start]renderStudentList(); [cite: 14]
            [cite_start]populateKegiatanDropdown(); [cite: 14]
            [cite_start]populateGrupBandDropdown(); [cite: 14]
            [cite_start]hideLoading(); [cite: 14]
        } catch (error) {
            [cite_start]console.error("Error loading initial data:", error); [cite: 14]
            [cite_start]alert("Gagal memuat data. Cek koneksi dan URL Apps Script."); [cite: 15]
            hideLoading();
        }
    }

    async function postData(data) {
        showLoading();
        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({
                    ...data
                })
            [cite_start]}); [cite: 17]
            [cite_start]console.log("Operasi dikirim. Memuat ulang data..."); [cite: 18]
            [cite_start]await loadInitialData(); [cite: 19]
        } catch (error) {
            [cite_start]console.error('Error posting data:', error); [cite: 19]
            [cite_start]alert('Terjadi kesalahan saat mengirim data.'); [cite: 20]
            hideLoading();
        }
    }

    function renderCoachList() {
        coachListEl.innerHTML = '';
        [cite_start]PELATIH_PENDAMPING.forEach(p => { [cite: 21]
            const itemHTML = `
                <div class="list-item">
                    <span class="item-name">${p.nama} (${p.peran})</span>
                    <div class="item-actions">
                        [cite_start]<button class="btn-hadir" data-nama="${p.nama}" data-peran="${p.peran}">HADIR</button> [cite: 22]
                        <button class="btn-tidak-hadir" data-nama="${p.nama}" data-peran="${p.peran}">TIDAK HADIR</button>
                    </div>
                </div>
            `;
            coachListEl.insertAdjacentHTML('beforeend', itemHTML);
        });
    }

    function renderStudentList() {
        studentListEl.innerHTML = '<p>Memuat siswa...</p>';
        [cite_start]const filterKegiatan = jenisKegiatanEl.value; [cite: 24]
        [cite_start]const filterBandId = pilihGrupBandEl.value; [cite: 24]
        let siswaTampil = [];

        if (filterKegiatan === 'Semua') {
            [cite_start]siswaTampil = semuaSiswa; [cite: 25]
        [cite_start]} else if (filterKegiatan === 'Band') { [cite: 26]
            if (filterBandId) {
                const anggotaIds = semuaAnggotaBand
                    .filter(anggota => anggota.bandId === filterBandId)
                    .map(anggota => anggota.siswaId);
                [cite_start]siswaTampil = semuaSiswa.filter(siswa => anggotaIds.includes(siswa.id)); [cite: 27]
            } else {
                siswaTampil = [];
            }
        } else {
            [cite_start]siswaTampil = semuaSiswa.filter(siswa => siswa.minat === filterKegiatan); [cite: 29]
        }

        studentListEl.innerHTML = '';
        if (siswaTampil.length === 0) {
            studentListEl.innerHTML = '<p>Tidak ada siswa untuk kegiatan ini.</p>';
            [cite_start]return; [cite: 30]
        }

        siswaTampil.sort((a, b) => a.nama.localeCompare(b.nama)).forEach(siswa => {
            const bandInfo = semuaAnggotaBand.find(anggota => anggota.siswaId === siswa.id);
            let namaBand = '';
            if (bandInfo) {
                const band = semuaGrupBand.find(b => b.id === bandInfo.bandId);
                [cite_start]if (band) namaBand = band.nama; [cite: 31]
            }

            const itemHTML = `
                <div class="list-item" data-id-siswa="${siswa.id}">
                    <div>
                        <span class="item-name">${siswa.nama}</span>
                        [cite_start]<span class="student-details"> [cite: 32]
                            Minat: ${siswa.minat || 'N/A'} | Band: ${namaBand || 'N/A'}
                        </span>
                    </div>
                    <div class="item-actions">
                        [cite_start]<button class="btn-edit" title="Edit Siswa">✏️</button> [cite: 33]
                        <button class="btn-delete" title="Hapus Siswa">🗑️</button>
                        <button class="btn-hadir" data-nama="${siswa.nama}" data-peran="Siswa">HADIR</button>
                        <button class="btn-tidak-hadir" data-nama="${siswa.nama}" data-peran="Siswa">TIDAK HADIR</button>
                    </div>
                </div>
            `;
            studentListEl.insertAdjacentHTML('beforeend', itemHTML);
        });
    }

    function populateKegiatanDropdown() {
        [...jenisKegiatanEl.options].forEach(option => {
            if (option.value !== 'Semua') option.remove();
        });
        [cite_start]semuaKegiatan.forEach(kegiatan => { [cite: 36]
            if (kegiatan) {
                const option = new Option(kegiatan, kegiatan);
                jenisKegiatanEl.add(option);
            }
        });
    }

    function populateGrupBandDropdown() {
        pilihGrupBandEl.innerHTML = '<option value="">-- Pilih Band --</option>';
        [cite_start]semuaGrupBand.forEach(band => { [cite: 38]
            const option = new Option(band.nama, band.id);
            pilihGrupBandEl.add(option);
        });
    }

    function closeAllModals() {
        [cite_start]document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none'); [cite: 63]
    }

    function showLoading() {
        [cite_start]console.log("Loading..."); [cite: 65]
    }

    function hideLoading() {
        [cite_start]console.log("Loading complete."); [cite: 67]
    }

    // ########## EVENT HANDLERS ##########
    jenisKegiatanEl.addEventListener("change", () => {
        [cite_start]grupBandContainer.style.display = jenisKegiatanEl.value === 'Band' ? 'flex' : 'none'; [cite: 42]
        [cite_start]renderStudentList(); [cite: 42]
    });

    [cite_start]pilihGrupBandEl.addEventListener("change", renderStudentList); [cite: 43]

    btnTambahSiswa.addEventListener("click", () => {
        [cite_start]modalSiswaTitle.textContent = "Tambah Siswa Baru"; [cite: 44]
        [cite_start]editSiswaId.value = ''; [cite: 44]
        [cite_start]inputNamaSiswa.value = ''; [cite: 44]
        [cite_start]inputMinatSiswa.value = ''; [cite: 44]
        [cite_start]modalSiswa.style.display = "block"; [cite: 44]
    });

    document.getElementById('attendance-list').addEventListener('click', async (e) => {
        const listItem = e.target.closest('.list-item');
        if (!listItem) return;

        const idSiswa = listItem.dataset.idSiswa;
        const siswa = semuaSiswa.find(s => s.id === idSiswa);

        if (e.target.classList.contains('btn-edit')) {
            if (siswa) {
                [cite_start]modalSiswaTitle.textContent = "Edit Data Siswa"; [cite: 48]
                [cite_start]editSiswaId.value = siswa.id; [cite: 48]
                [cite_start]inputNamaSiswa.value = siswa.nama; [cite: 48]
                [cite_start]inputMinatSiswa.value = siswa.minat; [cite: 48]
                [cite_start]modalSiswa.style.display = "block"; [cite: 48]
            }
        } else if (e.target.classList.contains('btn-delete')) {
            [cite_start]if (siswa && confirm(`Apakah Anda yakin ingin menghapus siswa "${siswa.nama}"?`)) { [cite: 49]
                await postData({ action: 'deleteStudent', id: siswa.id });
            }
        } else if (e.target.classList.contains('btn-hadir')) {
            const nama = e.target.dataset.nama;
            [cite_start]const peran = e.target.dataset.peran; [cite: 51]
            const tanggal = hariTanggalEl.value;
            if (!tanggal) {
                alert("Harap isi Hari & Tanggal terlebih dahulu!");
                [cite_start]return; [cite: 52]
            }
            const payload = {
                action: "saveAttendance", tanggal, kegiatan: jenisKegiatanEl.value, nama, peran, status: "Hadir", keterangan: ""
            };
            [cite_start]await postData(payload); [cite: 53]
            listItem.style.backgroundColor = '#d4edda';
        } else if (e.target.classList.contains('btn-tidak-hadir')) {
            const nama = e.target.dataset.nama;
            [cite_start]const peran = e.target.dataset.peran; [cite: 55]
            dataAbsenSementara = { nama, peran, listItem };
            [cite_start]namaTidakHadirEl.textContent = `Nama: ${nama}`; [cite: 56]
            [cite_start]modalKeterangan.style.display = 'block'; [cite: 56]
        }
    });

    btnSimpanSiswa.addEventListener("click", async () => {
        const id = editSiswaId.value;
        const nama = inputNamaSiswa.value.trim();
        const minat = inputMinatSiswa.value;

        if (!nama || !minat) {
            alert("Nama dan Minat harus diisi!");
            return;
        }

        [cite_start]const action = id ? "editStudent" : "addStudent"; [cite: 46]
        const payload = { action, nama, minat, id };

        closeAllModals();
        await postData(payload);
    });

    btnSimpanKeterangan.addEventListener('click', async () => {
        const tanggal = hariTanggalEl.value;
        if (!tanggal) { alert("Harap isi Hari & Tanggal terlebih dahulu!"); return; }
        
        const statusSingkat = pilihanKeteranganEl.value;
        const keteranganLengkap = inputKeteranganEl.value.trim();
        
        const payload = {
            action: "saveAttendance", tanggal, kegiatan: jenisKegiatanEl.value,
            nama: dataAbsenSementara.nama, peran: dataAbsenSementara.peran,
            status: statusSingkat, keterangan: keteranganLengkap
        [cite_start]}; [cite: 59]

        if(dataAbsenSementara.listItem) {
            dataAbsenSementara.listItem.style.backgroundColor = '#f8d7da';
        }

        closeAllModals();
        await postData(payload);
        inputKeteranganEl.value = '';
    });

    btnTambahGrup.addEventListener("click", () => {
        [cite_start]modalGrupBand.style.display = "block"; [cite: 60]
    });

    btnSimpanGrupBand.addEventListener("click", async () => {
        const namaBand = inputNamaBand.value.trim();
        if (!namaBand) {
            alert("Nama band tidak boleh kosong!");
            return;
        }
        await postData({ action: 'addBand', namaBand });
        inputNamaBand.value = '';
        [cite_start]closeAllModals(); [cite: 62]
    });

    document.querySelectorAll('.close-button').forEach(btn => {
        [cite_start]btn.addEventListener('click', closeAllModals); [cite: 63]
    });

    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            [cite_start]closeAllModals(); [cite: 64]
        }
    });

    btnSavePdf.addEventListener('click', () => {
        const printableArea = document.getElementById('printable-area');
        const tanggal = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
        const fileName = `Absensi-Musik-${tanggal}.pdf`;

        html2canvas(printableArea, { scale: 2 }).then(canvas => {
            [cite_start]const imgData = canvas.toDataURL('image/png'); [cite: 70]
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            [cite_start]const pdfWidth = pdf.internal.pageSize.getWidth(); [cite: 71]
            [cite_start]const pdfHeight = (canvas.height * pdfWidth) / canvas.width; [cite: 71]
            [cite_start]pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight); [cite: 72]
            [cite_start]pdf.save(fileName); [cite: 73]
        });
    });

    // ########## INISIALISASI ##########
    [cite_start]hariTanggalEl.valueAsDateTime = new Date(); [cite: 67]
    [cite_start]loadInitialData(); [cite: 68]
});
