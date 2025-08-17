document.addEventListener("DOMContentLoaded", () => {
    // ########## PENGATURAN ##########
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxXQGyvl5qo6iqSj7ljiKSzh5aHgDFrp96gFyLgTp_nxkC5X9_OxgpgzE11hZcy09JKEg/exec"; // GANTI DENGAN URL WEB APP ANDA
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
    const btnSavePdf = document.getElementById("btn-save-pdf");
    const btnTambahSiswa = document.getElementById("btn-tambah-siswa");
    const btnTambahGrup = document.getElementById("btn-tambah-grup");
    const modalSiswa = document.getElementById("modal-siswa");
    const modalSiswaTitle = document.getElementById("modal-siswa-title");
    const editSiswaId = document.getElementById("edit-siswa-id");
    const inputNamaSiswa = document.getElementById("input-nama-siswa");
    const inputMinatSiswa = document.getElementById("input-minat-siswa");
    const btnSimpanSiswa = document.getElementById("btn-simpan-siswa");
    const modalKeterangan = document.getElementById("modal-keterangan");
    const namaTidakHadirEl = document.getElementById("nama-tidak-hadir");
    const pilihanKeteranganEl = document.getElementById("pilihan-keterangan");
    const inputKeteranganEl = document.getElementById("input-keterangan");
    const btnSimpanKeterangan = document.getElementById("btn-simpan-keterangan");
    const modalGrupBand = document.getElementById("modal-grup-band");
    const inputNamaBand = document.getElementById("input-nama-band");
    const btnSimpanGrupBand = document.getElementById("btn-simpan-grup-band");
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
    async function loadInitialData() {
    console.log("Memulai proses loadInitialData..."); // MATA-MATA 1
    showLoading();
    try {
        const urlToFetch = `${SCRIPT_URL}?action=getInitialData`;
        console.log("URL yang sedang direquest:", urlToFetch); // MATA-MATA 2

        const response = await fetch(urlToFetch);

        console.log("Response header dari server:", response.status, response.statusText); // MATA-MATA 3
        
        const data = await response.json();
        console.log("Data mentah (raw) yang diterima dari server:", data); // MATA-MATA 4
        
        semuaSiswa = data.siswa.filter(s => s.status === 'Aktif');
        console.log("Data siswa yang sudah difilter dan akan ditampilkan:", semuaSiswa); // MATA-MATA 5

        semuaKegiatan = data.kegiatan;
        semuaGrupBand = data.grupBand;
        semuaAnggotaBand = data.anggotaBand;
        
        renderCoachList();
        renderStudentList();
        populateKegiatanDropdown();
        populateGrupBandDropdown();
        hideLoading();
        console.log("Proses loadInitialData selesai dengan sukses."); // MATA-MATA 6

    } catch (error) {
        console.error("KRITIS: Terjadi error di dalam blok 'catch' saat loadInitialData:", error); // MATA-MATA 7
        alert("Gagal memuat data. Cek Developer Console (F12) untuk detail error.");
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
            });
            console.log("Operasi dikirim. Memuat ulang data...");
            await loadInitialData();
        } catch (error) {
            console.error('Error posting data:', error);
            alert('Terjadi kesalahan saat mengirim data.');
            hideLoading();
        }
    }

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

        siswaTampil.sort((a, b) => a.nama.localeCompare(b.nama)).forEach(siswa => {
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

    function populateKegiatanDropdown() {
        [...jenisKegiatanEl.options].forEach(option => {
            if (option.value !== 'Semua') option.remove();
        });
        semuaKegiatan.forEach(kegiatan => {
            if (kegiatan) {
                const option = new Option(kegiatan, kegiatan);
                jenisKegiatanEl.add(option);
            }
        });
    }

    function populateGrupBandDropdown() {
        pilihGrupBandEl.innerHTML = '<option value="">-- Pilih Band --</option>';
        semuaGrupBand.forEach(band => {
            const option = new Option(band.nama, band.id);
            pilihGrupBandEl.add(option);
        });
    }

    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    }

    function showLoading() {
        console.log("Loading...");
    }

    function hideLoading() {
        console.log("Loading complete.");
    }

    // ########## EVENT HANDLERS ##########
    jenisKegiatanEl.addEventListener("change", () => {
        grupBandContainer.style.display = jenisKegiatanEl.value === 'Band' ? 'flex' : 'none';
        renderStudentList();
    });

    pilihGrupBandEl.addEventListener("change", renderStudentList);

    btnTambahSiswa.addEventListener("click", () => {
        modalSiswaTitle.textContent = "Tambah Siswa Baru";
        editSiswaId.value = '';
        inputNamaSiswa.value = '';
        inputMinatSiswa.value = '';
        modalSiswa.style.display = "block";
    });

    document.getElementById('attendance-list').addEventListener('click', async (e) => {
        const listItem = e.target.closest('.list-item');
        if (!listItem) return;

        const idSiswa = listItem.dataset.idSiswa;
        const siswa = semuaSiswa.find(s => s.id === idSiswa);

        if (e.target.classList.contains('btn-edit')) {
            if (siswa) {
                modalSiswaTitle.textContent = "Edit Data Siswa";
                editSiswaId.value = siswa.id;
                inputNamaSiswa.value = siswa.nama;
                inputMinatSiswa.value = siswa.minat;
                modalSiswa.style.display = "block";
            }
        } else if (e.target.classList.contains('btn-delete')) {
            if (siswa && confirm(`Apakah Anda yakin ingin menghapus siswa "${siswa.nama}"?`)) {
                await postData({ action: 'deleteStudent', id: siswa.id });
            }
        } else if (e.target.classList.contains('btn-hadir')) {
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
            listItem.style.backgroundColor = '#d4edda';
        } else if (e.target.classList.contains('btn-tidak-hadir')) {
            const nama = e.target.dataset.nama;
            const peran = e.target.dataset.peran;
            dataAbsenSementara = { nama, peran, listItem };
            namaTidakHadirEl.textContent = `Nama: ${nama}`;
            modalKeterangan.style.display = 'block';
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

        const action = id ? "editStudent" : "addStudent";
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
        };

        if(dataAbsenSementara.listItem) {
            dataAbsenSementara.listItem.style.backgroundColor = '#f8d7da';
        }

        closeAllModals();
        await postData(payload);
        inputKeteranganEl.value = '';
    });

    btnTambahGrup.addEventListener("click", () => {
        modalGrupBand.style.display = "block";
    });

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

    document.querySelectorAll('.close-button').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    btnSavePdf.addEventListener('click', () => {
        const printableArea = document.getElementById('printable-area');
        const tanggal = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
        const fileName = `Absensi-Musik-${tanggal}.pdf`;

        html2canvas(printableArea, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(fileName);
        });
    });

    // ########## INISIALISASI ##########
    hariTanggalEl.valueAsDateTime = new Date();
    loadInitialData();
});
