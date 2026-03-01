// 替換為您的 Google Apps Script Web App URL
const GAS_URL = "https://script.google.com/macros/s/AKfycbxc7G77CShxMbZ_YM2on06Hdscdfm2OZ7CquRyjbC9bfMKQ5sulLJKTQrSY1frHkTI4/exec";

// 處理農曆/國曆切換
document.querySelectorAll('.calendar-select').forEach(select => {
    select.addEventListener('change', function () {
        const optionDiv = this.closest('.light-option');
        const birthdayInput = optionDiv.querySelector('.birthday-input');
        if (birthdayInput) {
            if (this.value === '農曆') {
                birthdayInput.type = 'text';
                birthdayInput.placeholder = 'YYYY/MM/DD';
            } else {
                birthdayInput.type = 'date';
                birthdayInput.placeholder = '';
            }
        }
    });
});

// 處理燈種勾選，展開對應子表單並設定必填
document.querySelectorAll('input[name="lightType"]').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        const optionDiv = this.closest('.light-option');
        const subForm = optionDiv.querySelector('.sub-form');
        const requiredInputs = subForm.querySelectorAll('input[type="text"], input[type="date"], textarea');
        const lightValue = this.value;

        if (this.checked) {
            subForm.classList.remove('hidden');
            requiredInputs.forEach(input => {
                // 預設姓名與生日必填
                let isRequired = true;

                // 處理特殊必填規則
                if (input.name.startsWith('address_')) {
                    isRequired = (lightValue === '祝福地基主'); // 只有地基主必填地址
                } else if (input.name.startsWith('remarks_')) {
                    isRequired = (lightValue === '客製化點燈'); // 只有客製化必填備註
                }

                input.required = isRequired;
            });
        } else {
            subForm.classList.add('hidden');
            requiredInputs.forEach(input => input.required = false);
        }
    });
});

const orderForm = document.getElementById('orderForm');
if (orderForm) {
    orderForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // 檢查是否有選擇燈種
        const lightBoxes = document.querySelectorAll('input[name="lightType"]:checked');
        if (lightBoxes.length === 0) {
            alert("請至少選擇一種祈福燈種！");
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const loader = submitBtn.querySelector('.loader');

        // 切換按鈕狀態為載入中
        submitBtn.disabled = true;
        btnText.textContent = "資料送出中...";
        loader.style.display = "inline-block";

        // 收集表單資料
        const formData = new FormData(this);
        const phone = formData.get('phone') || '';
        const payloadArray = [];

        lightBoxes.forEach(checkbox => {
            const type = checkbox.value;
            payloadArray.push({
                name: formData.get(`name_${type}`) || '',
                phone: phone,
                calendarType: formData.get(`calendarType_${type}`) || '國曆',
                birthday: formData.get(`birthday_${type}`) || '',
                address: formData.get(`address_${type}`) || '',
                lightType: type,
                remarks: formData.get(`remarks_${type}`) || '無'
            });
        });

        try {
            // 發送 POST 請求至 Google Apps Script
            const response = await fetch(GAS_URL, {
                method: 'POST',
                body: JSON.stringify(payloadArray), // 現在改傳送陣列
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                }
            });

            // if response is ok
            document.getElementById('orderForm').classList.add('hidden');
            document.getElementById('successMessage').classList.remove('hidden');

        } catch (error) {
            console.error('Error!', error.message);
            // 若 GAS_URL 尚未設定或發生錯誤，因為是展示版或開發階段，直接顯示成功畫面做預覽
            if (GAS_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL" || GAS_URL === "") {
                console.log("發現使用預設 URL，展示成功畫面");
                document.getElementById('orderForm').classList.add('hidden');
                document.getElementById('successMessage').classList.remove('hidden');
            } else {
                alert('送出失敗，請稍後再試。');
                submitBtn.disabled = false;
                btnText.textContent = "確認點燈";
                loader.style.display = "none";
            }
        }
    });
}
