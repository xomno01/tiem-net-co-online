# Radio Quán Net — Audio credits

Tuyển chọn và xử lý cho bản game ngày 2026-09-28. Nhạc và bộ Foley được lưu cùng game; không phụ thuộc dịch vụ phát nhạc hay tài khoản bên ngoài.

## Nhạc nền

| Bài | Tác giả | Tệp trong game | Nguồn / giấy phép |
|---|---|---|---|
| Florist | TAD | florist.m4a | [CC0](https://opengameart.org/content/lofi-compilation) |
| Countryside | TAD | countryside.m4a | [CC0](https://opengameart.org/content/lofi-compilation) |
| Chill lofi inspired | omfgdude | chill.m4a | [CC0](https://opengameart.org/node/74097) |
| lofi hip hop | omfgdude | hiphop.m4a | [CC0](https://opengameart.org/content/lofi-hip-hop) |
| Lofi Hip Hop Loop | omfgdude | day.m4a | [CC0](https://opengameart.org/content/lofi-hip-hop-loop) |
| Lofi again | omfgdude | night.m4a | [CC0](https://opengameart.org/content/lofi-again) |

## Hiệu ứng và không gian

- **Kenney — Interface Sounds**: click, tab, coin, reward, success, levelup, error, sweep, pickup, power, power-on, pop, deny. [Nguồn CC0](https://kenney.nl/assets/interface-sounds). Giữ nguyên giấy phép trong `interface-LICENSE.txt`.
- **Kenney — Impact Sounds**: bell, place, wrench. [Nguồn CC0](https://kenney.nl/assets/impact-sounds). Giữ nguyên giấy phép trong `impact-LICENSE.txt`.
- **vicleb — Computer fan**: `fan.wav`. [Nguồn CC0](https://freesound.org/people/vicleb/sounds/712876/).
- **fennelliott — Keyboard Typing**: `typing1.wav`, `typing2.wav`, `typing3.wav`. [Nguồn CC0](https://freesound.org/people/fennelliott/sounds/379418/).
- **qubodup — Water Pouring**: `pour.wav`, `kettle.wav`. [Nguồn CC0](https://freesound.org/people/qubodup/sounds/210429/).

## Chỉnh sửa trong bản game

Nhạc được cân loudness mục tiêu −21 LUFS, giới hạn true peak −2 dBTP, mã hóa MP3 128 kbps / 44.1 kHz; sáu bài bổ sung được lọc nhẹ dưới 35 Hz / trên 11.5 kHz. Giữ tên bài và tác giả gốc. Crossfade 3 giây do bộ phát thực hiện, không thay tốc độ bản nhạc theo tốc độ mô phỏng.

Foley được cắt đoạn, bỏ DC, lọc tần số 80–5500 Hz, fade mép 25 ms và cân mức; quạt nối vòng với đoạn chuyển 1 giây. Ba biến thể bàn phím dùng các đoạn thu khác nhau. Kenney được cân RMS/peak và điều chỉnh âm lượng riêng theo loại hành động.

`playlist.json` ghi URL tải gốc, SHA-256, thời lượng và loudness đo lại trên các tệp giao. `manifest.json` ghi nguồn từng SFX và thời lượng. `sources.json` ghi các URL ghi âm gốc. CC0: https://creativecommons.org/publicdomain/zero/1.0/

## Không gian quán mở rộng — 2026-09-28

- `typing4.wav`–`typing9.wav`: **stu556 — Mechanical Keyboard Typing (Bass Version)**, [CC0](https://freesound.org/people/stu556/sounds/450281/). Cắt từ các đoạn thu riêng, lọc dải chói và fade mép.
- `typing10.wav`: **bigmonmulgrew — mechanical key soft.wav**, [CC0](https://freesound.org/people/bigmonmulgrew/sounds/378083/). Phối lại thành nhịp gõ thưa.
- `mouse1.wav`: **SamsterBirdies — mouseclick.mp3**, [CC0](https://freesound.org/people/SamsterBirdies/sounds/321411/).
- `mouse2.wav`–`mouse5.wav`: **chestnutjam — mouse clicks**, [CC0](https://freesound.org/people/chestnutjam/sounds/399443/). Cắt các cụm click khác nhau.
- `lighter1.wav`, `lighter2.wav`: **Romeo_Kaleikau — Lighter Smoke.wav**, [CC0](https://freesound.org/people/Romeo_Kaleikau/sounds/622700/). Tách động tác bật lửa và phần kết, hạ dải cao.
- `monitor1.wav`, `monitor2.wav`: **“Hard Plastic Case Taps” by BudgetPixel AI**, [nguồn](https://budgetpixel.com/sfx/hard-plastic-case-taps-4d32280a), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Âm tổng hợp AI gõ vỏ nhựa cứng, dùng làm Foley vỏ màn hình; cắt hai nhóm gõ, lọc tối và cân mức. Không phải bản thu màn hình thật.

### Đã bỏ khỏi game

Âm thanh thoại AI và các đoạn nền ghép từ thoại đã được loại khỏi game để giảm dung lượng tải.


## Nén lại để giảm dung lượng (2026-10-01)

Nhạc nền được nén lại AAC-LC (96 kbps stereo / 64 kbps mono) và tiếng không khí quán (gõ phím, chuột, bật lửa, màn hình, ấm nước, rót nước) được nén AAC (.m4a); tiếng quạt hạ còn 22,05 kHz. Hai bài nặng nhất cũng đã bỏ khỏi game để giảm lượt tải. Bản gốc lưu ở `tools/audio/masters/` (không đưa vào bản build).
