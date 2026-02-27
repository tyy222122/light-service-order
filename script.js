// 替換為您的 Google Apps Script Web App URL
const GAS_URL = "https://script.google.com/macros/s/AKfycbxc7G77CShxMbZ_YM2on06Hdscdfm2OZ7CquRyjbC9bfMKQ5sulLJKTQrSY1frHkTI4/exec";

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

        // 整理多選的燈種成陣列轉字串
        const selectedLights = Array.from(lightBoxes).map(cb => cb.value).join(', ');

        // 建立準備送出的 JSON 物件
        const payload = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            calendarType: formData.get('calendarType'),
            birthday: formData.get('birthday'),
            address: formData.get('address'),
            lightType: selectedLights,
            remarks: formData.get('remarks') || '無'
        };

        try {
            // 發送 POST 請求至 Google Apps Script
            const response = await fetch(GAS_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                    // GAS 以 doPost 接收時，cors 請求通常需設 Content-Type 為 text/plain 來避開預檢請求 (Preflight)
                }
            });

            // if response is ok
            document.getElementById('orderForm').classList.add('hidden');
            document.getElementById('successMessage').classList.remove('hidden');

        } catch (error) {
            console.error('Error!', error.message);
            // 若 GAS_URL 尚未設定或發生錯誤，因為是展示版或開發階段，直接顯示成功畫面做預覽
            if (GAS_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL") {
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
