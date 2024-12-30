document.addEventListener('DOMContentLoaded', () => {
    // Bugünün tarihini al
    const today = new Date();

    // Yardımcı fonksiyonları önce tanımlayalım
    // Tarih formatı yardımcı fonksiyonları
    const getTodayDate = () => {
        return today.toISOString().split('T')[0];
    };

    // TÜFE bilgi metnini güncelle
    const updateTUFEInfo = (date, value) => {
        const tufeInfo = document.createElement('div');
        tufeInfo.className = 'tufe-info';
        
        const dateObj = new Date(date);
        const monthYear = new Intl.DateTimeFormat('tr-TR', { 
            month: 'long', 
            year: 'numeric' 
        }).format(dateObj);

        tufeInfo.innerHTML = `
            <p><small>* ${monthYear} ayı TÜFE ortalaması: %${value}</small></p>
            <p><small>* Bu oran her ay TÜİK tarafından açıklanmaktadır.</small></p>
        `;

        // Eski TÜFE bilgisini kaldır
        const oldTufeInfo = increaseRateInput.parentNode.querySelector('.tufe-info');
        if (oldTufeInfo) {
            oldTufeInfo.remove();
        }

        increaseRateInput.parentNode.appendChild(tufeInfo);
    };

    // Güncel TÜFE değeri (manuel olarak güncellenecek)
    const currentTUFE = {
        value: 64.86,
        lastUpdate: '2024-01-03', // Son güncelleme tarihi
        description: 'Ocak 2024'
    };

    // DOM elementlerini seç
    const rentForm = document.getElementById('rentForm');
    const resultBox = document.getElementById('result');
    const increaseRateInput = document.getElementById('increaseRate');
    const contractWarning = document.getElementById('contractWarning');
    const fiveYearInfo = document.getElementById('fiveYearInfo');
    const contractDateInput = document.getElementById('contractDate');
    const disclaimerModal = document.getElementById('disclaimerModal');
    const acceptButton = document.getElementById('acceptDisclaimer');
    const rejectButton = document.getElementById('rejectDisclaimer');
    
    // Form verileri için geçici depolama
    let formData = null;
    
    // Maksimum tarihi ayarla (bugün)
    const maxDate = today.toISOString().split('T')[0];
    contractDateInput.setAttribute('max', maxDate);

    // TÜFE bilgisini göster
    updateTUFEInfo(currentTUFE.lastUpdate, currentTUFE.value);
    
    // Para formatı için yardımcı fonksiyon
    const formatCurrency = (number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number);
    };

    // Kontrat süresini hesaplama fonksiyonu
    const calculateContractDuration = (contractDate) => {
        const start = new Date(contractDate);
        const diffTime = Math.abs(today - start);
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25); // 365.25 artık yılları hesaba katar
        return diffYears;
    };

    // Kontrat tarihinin geçerliliğini kontrol et
    const isValidContractDate = (contractDate) => {
        const date = new Date(contractDate);
        return date <= today;
    };

    // Hesaplama fonksiyonu
    const calculateRent = () => {
        if (!formData) return;
        
        const { currentRent, increaseRate, contractDate } = formData;
        
        // Kontrat süresini hesapla
        const contractDuration = calculateContractDuration(contractDate);
        
        // Uyarıları kontrol et ve göster
        contractWarning.style.display = contractDuration >= 10 ? 'block' : 'none';
        fiveYearInfo.style.display = contractDuration >= 5 && contractDuration < 10 ? 'block' : 'none';
        
        // Hesaplamaları yap
        const increaseAmount = currentRent * (increaseRate / 100);
        const newRent = currentRent + increaseAmount;
        
        // Sonuçları göster
        document.getElementById('currentRentResult').textContent = formatCurrency(currentRent);
        document.getElementById('increaseAmount').textContent = formatCurrency(increaseAmount);
        document.getElementById('newRent').textContent = formatCurrency(newRent);
        document.getElementById('contractDuration').textContent = 
            `${Math.floor(contractDuration)} yıl ${Math.floor((contractDuration % 1) * 12)} ay`;
        
        // Sonuç kutusunu göster
        resultBox.style.display = 'block';
        
        // Sonuçlara kaydır
        resultBox.scrollIntoView({ behavior: 'smooth' });
    };

    // Form gönderildiğinde
    rentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Form değerlerini al
        const currentRent = parseFloat(document.getElementById('currentRent').value);
        let increaseRate = document.getElementById('increaseRate').value;
        const contractDate = document.getElementById('contractDate').value;

        // Artış oranı boş bırakıldıysa güncel TÜFE değerini kullan
        if (!increaseRate) {
            increaseRate = currentTUFE.value;
        } else {
            increaseRate = parseFloat(increaseRate);
        }
        
        // Tarih kontrolü
        if (!isValidContractDate(contractDate)) {
            alert('Kontrat tarihi geçersiz! Kontrat tarihi bugünden ve gelecek tarihlerden küçük olmalıdır.');
            return;
        }

        // Minimum 6 ay kontrolü
        const contractDateObj = new Date(contractDate);
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        
        if (contractDateObj > sixMonthsAgo) {
            alert('Kira artışı yapabilmek için kontrat süresinin en az 6 ay olması gerekmektedir.');
            return;
        }
        
        // Form verilerini sakla
        formData = { currentRent, increaseRate, contractDate };
        
        // Sorumluluk reddi modalını göster
        disclaimerModal.style.display = 'block';
    });

    // Sorumluluk reddini kabul et
    acceptButton.addEventListener('click', () => {
        disclaimerModal.style.display = 'none';
        calculateRent();
    });

    // Sorumluluk reddini reddet
    rejectButton.addEventListener('click', () => {
        disclaimerModal.style.display = 'none';
        formData = null;
        alert('Hesaplama yapılabilmesi için sorumluluk reddi beyanını kabul etmeniz gerekmektedir.');
    });

    // Input validation - sadece pozitif sayılar
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            if (e.target.value < 0) {
                e.target.value = 0;
            }
        });
    });
}); 