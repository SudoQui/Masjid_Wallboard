document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'http://api.aladhan.com/v1/calendarByCity';
    const city = 'Canberra';
    const country = 'Australia';
    const method = 2;
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    fetch(`${apiUrl}/${year}/${month}?city=${city}&country=${country}&method=${method}`)
        .then(response => response.json())
        .then(data => {
            const timingsToday = data.data[today.getDate() - 1].timings;
            const timingsNextDay = data.data[today.getDate() % data.data.length].timings; // Handle next day's timings
            const gregorian = data.data[today.getDate() - 1].date.gregorian;
            const hijri = data.data[today.getDate() - 1].date.hijri;
            displayPrayerTimes(timingsToday);
            displayDates(gregorian, hijri);
            displayCurrentAndNextPrayer(timingsToday, timingsNextDay);
        })
        .catch(error => console.error('Error fetching data:', error));

    function displayPrayerTimes(timings) {
        const prayerTimesDiv = document.getElementById('prayer-times');
        const validPrayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        for (const [prayer, time] of Object.entries(timings)) {
            if (validPrayers.includes(prayer)) {
                const prayerDiv = document.createElement('div');
                const prayerName = document.createElement('span');
                const prayerTime = document.createElement('span');

                prayerName.textContent = prayer;
                prayerTime.textContent = time.split(' ')[0]; // Remove 'AEST'

                prayerDiv.appendChild(prayerName);
                prayerDiv.appendChild(prayerTime);
                prayerTimesDiv.appendChild(prayerDiv);
            }
        }
    }

    function displayDates(gregorian, hijri) {
        const gregorianDateDiv = document.getElementById('gregorian-date');
        const islamicDateDiv = document.getElementById('islamic-date');

        const gregorianDate = `${gregorian.weekday.en}, ${gregorian.day} ${gregorian.month.en}, ${gregorian.year}`;
        const islamicDate = `${hijri.month.en} ${hijri.day}, ${hijri.year} AH`;

        gregorianDateDiv.textContent = gregorianDate;
        islamicDateDiv.textContent = islamicDate;
    }

    function displayCurrentAndNextPrayer(timingsToday, timingsNextDay) {
        const now = new Date();
        let currentPrayer = '';
        let nextPrayer = '';
        let nextPrayerTime = '';

        const validPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        for (const [prayer, time] of Object.entries(timingsToday)) {
            if (validPrayers.includes(prayer)) {
                const prayerTime = new Date(`${now.toDateString()} ${time.split(' ')[0]}`); // Remove 'AEST'
                if (now >= prayerTime) {
                    currentPrayer = prayer;
                } else {
                    nextPrayer = prayer;
                    nextPrayerTime = prayerTime;
                    break;
                }
            }
        }

        // If no next prayer found for today, check next day's Fajr
        if (!nextPrayer) {
            nextPrayer = 'Fajr';
            nextPrayerTime = new Date(`${now.toDateString()} ${timingsNextDay.Fajr.split(' ')[0]}`); // Remove 'AEST'
            nextPrayerTime.setDate(nextPrayerTime.getDate() + 1); // Set to next day
        }

        const currentPrayerDiv = document.getElementById('current-prayer');
        const nextPrayerDiv = document.getElementById('next-prayer');

        currentPrayerDiv.textContent = `Current Prayer: ${currentPrayer}`;
        if (nextPrayer) {
            const diff = nextPrayerTime - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            nextPrayerDiv.textContent = `Next: ${nextPrayer} in ${hours} hours and ${minutes} minutes`;
        } else {
            nextPrayerDiv.textContent = 'No more prayers for today';
        }
    }

    function updateCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const currentTimeDiv = document.getElementById('current-time');
        currentTimeDiv.textContent = `${hours}:${minutes}:${seconds}`;
    }

    setInterval(updateCurrentTime, 1000);
    updateCurrentTime();
});
