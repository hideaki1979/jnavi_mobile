# Expo SDK アップグレード調査(SDK 52 → 56)

- **調査日**: 2026-06-12
- **調査方法**: npm 公式レジストリ照会 / Expo 公式ドキュメント / Google Play 公式要件ページ / ローカル環境での実機検証
- **背景**: 同日実施のセキュリティ脆弱性対応(Dependabot アラート13件+追加14件、`npm audit` 0件達成)の過程で、SDK 52 を維持したままのセキュリティ保守に限界があることが顕在化したため、最新 SDK への移行を調査した。

## 1. 結論

**アップグレードは強く推奨**。ただし「パッチ適用」ではなく「移行プロジェクト」として計画する。最大の山は New Architecture 移行(本プロジェクトは旧アーキテクチャ運用)。セキュリティ修正のコミットとは切り離し、専用ブランチで 1 SDK ずつ段階的に実施する。

工数を絞る場合は「まず SDK 54 まで」(旧アーキテクチャで動く最後の SDK)を中間目標とすれば、サポート問題と Google Play 要件はほぼ解消できる。

## 2. 現状構成(2026-06-12 時点)

| 項目 | 現状 |
|---|---|
| expo | ~52.0.47(SDK 52 系の最終版は 52.0.49) |
| react-native | 0.76.9 |
| react | 18.3.1 |
| expo-router | 4.x |
| react-native-reanimated | 3.16 |
| アーキテクチャ | **旧**(`app.json` の `newArchEnabled: false`) |
| Android targetSdkVersion | **34**(SDK 52 既定。生成済み `android/build.gradle` で確認) |
| ネイティブ管理 | CNG(`ios/`・`android/` は .gitignore、prebuild で生成) |
| 配信 | eas.json は APK ビルド + submit 設定あり(配信経路は要確認) |

## 3. アップグレードすべき根拠

### 3.1 SDK 52 はサポート終了済み、セキュリティ手動延命の限界

- 最新は **SDK 56**(2026-06-12 時点、npm dist-tags で確認)。Expo は年3回リリースで、SDK 52 は約4世代・1年半遅れ。
- 2026-06-12 のセキュリティ対応では overrides 6件 + postinstall シムという手動対応が必要だった。SDK が古いままだとこの種の延命作業が今後も増え続ける。
- アップグレードすればこれらの大半は撤去可能(§7 参照)。

### 3.2 Google Play の target API 要件(公式ページ確認済み)

- **2025-08-31 以降、新規アプリ・アップデートとも API 35 以上が必須**(Wear OS 等を除く)。
- 本プロジェクトは targetSdk 34 のため、**Google Play 配信している場合は現時点でアップデートを提出できない**。
- SDK 53 以降が target 35 に対応。要件は毎年8月に引き上げられるのが通例(次は API 36 が見込まれる)。
- ※「組織内部限定配布の永続的プライベートアプリ」は除外規定あり。APK 直接配布のみであれば当面は対象外。

### 3.3 旧アーキテクチャの廃止

- React Native 本体から旧アーキテクチャは削除済みで、**SDK 55(RN 0.83)以降は New Architecture のみ**。
- 本プロジェクトは `newArchEnabled: false` のため、SDK 55 以降に進むには New Architecture 移行が必須。先送りするほど一括移行の負担が増える。

## 4. バージョンギャップ(公式テンプレート expo-template-default で確認)

| SDK | expo | react-native | react | expo-router | reanimated | 備考 |
|---|---|---|---|---|---|---|
| 52(現在) | 52.0.47 | 0.76.9 | 18.3.1 | 4.x | 3.16 | |
| 53 | ~53.0.27 | 0.79.6 | 19.0.0 | ~5.1.11 | ~3.17.4 | **React 19 化**(JS 側最大の破壊的変更) |
| 54 | ~54.0.35 | 0.81.5 | 19.1.0 | ~6.0.23 | ~4.1.1 | target 35 / edge-to-edge。**旧アーキ最後の SDK** |
| 55 | ~55.0.26 | 0.83.6 | 19.2.0 | ~55.0.16 | 4.2.1 | **New Architecture のみ** |
| 56(最新) | ~56.0.11 | 0.85.3 | 19.2.3 | ~56.2.10 | 4.3.1 | reanimated 4 は新アーキ必須 |

※ expo-router は SDK 55 から SDK と同じバージョン番号体系に統合された。

## 5. ライブラリリスク評価

### 要実機検証(New Architecture 移行時の重点)

| ライブラリ | 現在 | リスク |
|---|---|---|
| react-native-maps | 1.18.0 | 新アーキ対応版へ要更新(対応バージョン要確認)。地図はアプリの中核機能のため最重点 |
| react-native-modal | ~~14.0.0-rc.1~~ → **削除済** | **未 import の孤立依存と判明 → 削除**(SDK 55 §13)。モーダルは react-native-paper の `Modal`/`Portal`、ボトムシートは @gorhom/bottom-sheet が担当しており、本パッケージはソースから一度も使われていなかった。「更新停止 RC を抱える」懸念ごと解消 |
| react-native-element-dropdown | 2.12.4 | 新アーキ対応状況の確認が必要 |

### 追従可能(バージョン更新で対応)

@react-native-firebase 22 / @react-native-google-signin 13 / react-native-paper 5 / @gorhom/bottom-sheet 5 / react-native-gesture-handler / @react-native-async-storage(2.x へ)

### 好材料

- CNG 運用のためネイティブディレクトリのマージ作業が不要(prebuild で再生成するだけ)
- アプリ規模が比較的小さい

## 6. 推奨手順(段階アップグレード)

Expo 公式は 1 SDK ずつの更新を推奨。各ステップで以下を繰り返す:

```bash
npx expo install expo@^XX --fix   # SDK本体と関連パッケージを一括更新
npx expo-doctor                    # 整合性チェック
# dev-client 再ビルド → 両OS実機確認
```

1. **セキュリティ修正(2026-06-12 分)を先にコミット**して切り離す ✅ 実施済み
2. **52 → 53**: React 19 化を吸収。旧アーキのまま可 ✅ 実施済み(§11 実施記録参照)
3. **53 → 54**: RN 0.81、target API 35、Android edge-to-edge 対応。**中間リリース可能地点**(Play 要件もここで解消)✅ 実施済み(§12 実施記録参照)
4. **SDK 54 上で `newArchEnabled: true`** に切替え、全画面 QA(地図・モーダル・ドロップダウン・BottomSheet が重点)✅ ステップ3と同時に実施済み(§12)。実機 QA はユーザー実施分が残(§12 末尾チェックリスト)
5. **54 → 55**: reanimated 4.2 / RN 0.83 / React 19.2 吸収。**新アーキは SDK 54 で済のため必須化はクリア済み**。config-plugins の hoist 問題と react-native-maps の Google Maps 統合方式変更が要対応 ✅ 実施済み(§13 実施記録参照)
6. **55 → 56**: 最新安定版(reanimated 4.3 / RN 0.85 / TS 6 等)へ。splash の plugin 移行と TS 6 の baseUrl 対応が要対応 ✅ 実施済み(§14 実施記録参照)
7. 完了時に overrides・postinstall シムを棚卸し(§7)

## 7. 現行セキュリティ対策の棚卸し(アップグレード時に撤去・再評価するもの)

2026-06-12 のセキュリティ対応で導入したもの。新 SDK では上流が追従するため、各ステップで `npm ls` / `npm audit` を確認しながら削除する。

| 対策 | 導入理由 | 状況(2026-06-12 SDK 53 移行時に再評価済み) |
|---|---|---|
| `scripts/patch-tar-cjs-interop.cjs` + postinstall | tar v7 強制により @expo/cli(SDK 52、tar ^6.2.1 固定)の CJS interop が壊れるため | **撤去済み**(SDK 53 の CLI は tar ^7.4.3 ネイティブ。シム無しで extractLocalNpmTarballAsync 実走 OK・prebuild 実走 OK を確認) |
| overrides: `tar ^7.5.16` | tar 6.x にパッチ版が存在しない | **撤去済み**(@expo/cli 自身の ^7.4.3 宣言から 7.5.16 が自然解決。`npm ls tar` で単一系統を確認) |
| overrides: `brace-expansion ^2.0.2` | 以前のセキュリティ対応(当時パッチ版なし) | **撤去済み**(minimatch@3 系はパッチ済み 1.1.15、minimatch@9 系は 2.1.1 に自然解決。v1→v2 強制は tar と同じ危険パターンのため解消) |
| overrides: `@xmldom/xmldom ^0.8.13` | @expo/plist が ~0.7.7 固定 | **撤去済み**(SDK 53 では @expo/plist / plist とも ^0.8.8 宣言になり 0.8.13 へ自然解決 = override が no-op 化) |
| overrides: `uuid ^11.1.1` | xcode が uuid ^7.0.3 に依存 | **維持必要**(xcode@3.0.1 のまま。次回 SDK で再評価) |
| overrides: `postcss ^8.5.10` | @expo/metro-config が ~8.4.32 固定 | **維持必要**(SDK 53 の @expo/metro-config 0.20.18 も ~8.4.32 固定のまま) |
| overrides: expo-dev-launcher 配下 `ajv ^8.18.0` | expo-dev-launcher が 8.11.0 完全固定 | **維持必要**(SDK 53 の expo-dev-launcher も 8.11.0 固定のまま。撤去すると GHSA-2g4f-4pwh-qvx6 が npm audit に再出現することを確認済み) |
| 直接依存 `axios ^1.17.0` | 脆弱性対応(公式安全基準 1.16.0+) | 撤去不要(維持) |

## 8. 工数目安

- フル(SDK 56 + New Architecture まで): **集中作業 3〜5 日 + 両 OS 実機 QA**
- 最小(SDK 54 まで、旧アーキ維持): **2 日程度**(サポート・Play 要件は解消、新アーキ移行は次の区切りへ)

## 9. 注意事項

- `src/components/inputs/VoiceInputButton.tsx` が未登録パッケージ `@react-native-voice/voice` を import しており `tsc --noEmit` が常に 2 エラーで失敗する(本調査以前からの既存問題)。アップグレード時の型チェック結果判定ではこの 2 エラーを除外するか、事前に依存登録 or コンポーネント整理で解消しておくこと。

## 10. 参考情報源

- Expo 公式ドキュメント(最新 SDK 構成): https://docs.expo.dev/versions/latest/
- Expo SDK アップグレード手順: https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/
- Expo SDK 53 チェンジログ(破壊的変更一覧): https://expo.dev/changelog/sdk-53
- Google Play target API 要件: https://developer.android.com/google/play/requirements/target-sdk
- npm 公式レジストリ(expo / expo-template-default / @expo/cli の dist-tags・依存関係、2026-06-12 時点)

## 11. 実施記録(SDK 52 → 53、2026-06-12、ブランチ feature/expo-sdk53-upgrade)

### 到達状態

| 項目 | 結果 |
|---|---|
| expo / react-native / react | 53.0.27 / 0.79.6 / 19.0.0 |
| expo-router / reanimated / maps | 5.1.11 / 3.17.5 / 1.20.1 |
| @types/react / typescript | 19.0.14 / 5.8.3 |
| アーキテクチャ | 旧アーキ維持(`newArchEnabled: false` を gradle.properties / Podfile.properties.json で確認) |
| Android target/compile/minSdk | **35 / 35 / 24**(Google Play API 35 要件をここで解消) |
| npm audit | 0 件 |
| `npx expo install --check` / `npx expo-doctor` | 最新一致 / 17/18(残 1 は React Native Directory メタデータ助言のみで非ブロッカー) |
| `tsc --noEmit` | 既知の VoiceInputButton 2 エラーのみ(§9) |
| Metro バンドル(`expo export --platform android`) | 成功(package exports 解決での破綻なし) |
| `expo prebuild --clean` + `pod install` | 成功(下記「ネイティブ再生成の検証」参照) |

### 対応が必要だった点

1. **npm の ERESOLVE(当初 `.npmrc` で対処 → 2026-06-13 に削除)**: 移行直後の expo-router 5.0.x では、オプショナルピア `react-server-dom-webpack` がどのバージョンも react 19.0.0 と整合せず(全 19.0.x が react ^19.0.x+1 を要求)、npm arborist の既知バグで配置不能なオプショナルピアが ERESOLVE エラーになったため、`.npmrc` に `legacy-peer-deps=true` を設定していた。**その後 expo-router が 5.1.11 に上がり、当該ピアが完全な optional 宣言(`~19.0.4 || ~19.1.5 || ~19.2.4`)になりツリーに実体導入されなくなった**(lockfile にはピア宣言として残るのみで誰も引き込まない)ため衝突源が消失。クリーンな `npm install --legacy-peer-deps=false`(package.json のみ)が **exit 0 / ERESOLVE 0 件**、`npm ci --legacy-peer-deps=false` も成功することを確認し、`.npmrc` を削除した(PR の Gemini bot 指摘への対応 = プロジェクト全体のピア検証無効化を解消)。残る `@firebase/auth` の async-storage ピア不一致は `peerOptional` のため警告のみで非ブロッカー(overrides 不要)。バージョン整合の検証は expo-doctor / expo install --check が担う。SDK 54 昇格時は react 19.1.x で再衝突しうるため、その時点でクリーン install を再評価。
2. **tsconfig の moduleResolution 上書き除去**: プロジェクト側の `"moduleResolution": "node"` が SDK 53 ベース設定(bundler + customConditions)と競合し TS5098 になるため削除。
3. **expo-asset の正式登録**: `src/app/simulation/*` 3 ファイルが import しているのに依存未登録(SDK 52 までは extraneous 残骸で偶然動作)。`npx expo install expo-asset`(~11.1.7)で登録。
4. **GoogleService-Info.plist をルートに配置**: app.config.ts の `ios.googleServicesFile` が `./GoogleService-Info.plist` を参照するが、実体が ios/ 内(prebuild --clean で消える場所)にしかなかったためルートへコピー(.gitignore 対象のため Git には入らない。ローカル保管必須)。

### ネイティブ再生成の検証(prebuild --clean 後)

設定ソースは app.config.ts(app.json の plugins 配列は app.config.ts が**上書き**する点に注意)。再生成後に以下を確認済み:

- android/app/google-services.json 配置 + google-services gradle プラグイン適用
- AndroidManifest に Maps API キー(.env から注入)+ 位置情報権限
- iOS: GoogleService-Info.plist 取り込み、AppDelegate.swift(SDK 53 で Swift 化)に `FirebaseApp.configure()` と firebaseauth reCAPTCHA の openURL ガード、Google Sign-In URL スキーム、static frameworks
- `pod install` 成功(DEFINES_MODULE 警告は use_frameworks + expo-dev-menu 併用時の既知の非致命警告)

### 残課題・注意

- ~~実機起動確認(Android / iPhone)が未実施~~ → **2026-06-12 両OSで起動確認済み**
  - Android: Pixel_9_API_35 エミュレータで起動・UI描画 OK。Map 画面の Network Error は SDK 起因ではなく、(1) dev ビルドは `http://10.0.2.2:3000` のローカルバックエンド(`~/develop/gs/Tech_Val/nodedeploytest`、`npm run dev` で起動)を参照する設計で未起動だったこと、(2) DB(Render 無料 PostgreSQL)がプロトコルレベルで接続不能(P1017、本番 API の /maps も 500)なこと、の2点が原因
  - DB は 2026-06-12 にローカル Docker PostgreSQL へ移行済み(Render 無料 DB はユーザーが削除)。バックエンドリポジトリの docker-compose.yml で `docker compose up -d` → ポート **5433**(Mac にネイティブ PostgreSQL が 5432 を常時占有しているため)。マイグレーション・マスタデータ投入済み。店舗/マップデータは消失のためアプリから再登録が必要。**本番(Render Web サービス)は DATABASE_URL の向き先がないままなので /maps は 500 のまま**
  - 地図タイル非表示(Google Maps SDK の Authorization failure)も 2026-06-13 解消・表示確認済み。dev ビルドは `android/app/debug.keystore`(Expo テンプレート同梱、SHA-1 `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`)で署名されるため、Google Cloud Console 側で Maps API キーにこの SHA-1 + `com.syumeikyo.jNavi` の組の認可が必要だった。**EAS 等でリリースビルドを作る際はリリース署名の SHA-1 を別途追加登録すること**。なお Console で Android アプリ制限の保存が「なし」に戻る事象があり、現状キーは無制限の可能性 → 最低限「API の制限」で Maps SDK for Android に絞ることを推奨
  - iOS: iPhone 16 Pro シミュレータ(iOS 26.1)でビルド成功・起動・JS ロード・位置情報許可ダイアログ表示まで確認。事前に `xcodebuild -downloadPlatform iOS` で iOS 26.1 プラットフォーム(8.3GB)の導入が必要だった(Xcode 26.1.1 更新後に未導入だとビルド先が認識されず error 70)
  - 開発環境メモ: ANDROID_HOME 未設定だと expo がエミュレータを自動起動できない → ~/.zshrc に `export ANDROID_HOME=$HOME/Library/Android/sdk` + platform-tools/emulator の PATH 追記済み
- app.json の expo-location プラグインオプション(フォアグラウンドサービス等)は app.config.ts の plugins 上書きにより**以前から無効**(現行挙動と同一のため今回維持。フォアグラウンドサービスが必要になったら app.config.ts 側へ追記)
- EAS Build を使う場合、EXPO_PUBLIC_* 環境変数(特に Maps API キー)と、iOS ビルド時は GOOGLE_SERVICE_INFO_PLIST(file タイプ)を EAS 環境変数に登録しておくこと
- edge-to-edge は未対応のまま(SDK 54 で必須化。§6 ステップ 3 で対応)
- SDK 52 のネイティブディレクトリは /tmp/jnavi-native-backup-sdk52 に退避済み(起動確認完了後は不要)

## 12. 実施記録(SDK 53 → 54 + New Architecture、2026-06-13、ブランチ feature/expo-sdk54-upgrade)

§6 のステップ3(53→54)とステップ4(New Architecture 有効化)を**同時実施**した。SDK 54 は旧アーキをサポートする最後の SDK だが、ここで新アーキへ移行しておくことで SDK 55/56 への道を開き、かつ reanimated を v4 化できる(下記)。

> **§4・§5 の表記補正**: §4 の表は「SDK 54 = reanimated ~4.1.1 / 旧アーキ最後」、§5 は「reanimated 4 は新アーキ必須」と一見矛盾していたが、正しくは **reanimated 4 は New Architecture 専用**(`react-native-worklets` を導入)。旧アーキ維持なら reanimated 3 据え置きが必要だった。本移行では新アーキを採用したため reanimated 4.1.x をそのまま使用できる。

### 到達状態

| 項目 | 結果 |
|---|---|
| expo / react-native / react / react-dom | 54.0.35 / 0.81.5 / 19.1.0 / 19.1.0 |
| expo-router / reanimated / worklets | 6.0.24 / 4.1.7 / 0.5.1(新規) |
| gesture-handler / screens / safe-area-context | 2.28.0 / 4.16.0 / 5.6.0 |
| @types/react / typescript | 19.1.x / 5.9.3 |
| react-native-maps | 1.20.1(据置・新アーキ interop で動作) |
| アーキテクチャ | **New Architecture**(`newArchEnabled: true` を app.json / gradle.properties / Podfile.properties.json で確認) |
| Android target/compile/minSdk | **35 / 35 / 24**(expo-root-project 既定。Google Play API 35 要件維持) |
| edge-to-edge | **有効**(`edgeToEdgeEnabled=true`。SDK 54 で Android 強制) |
| npm audit | **0 件** |
| `npx expo install --check` / `npx expo-doctor` | 最新一致 / **18/18 全合格**(SDK 53 の 17/18 から改善) |
| `tsc --noEmit` | 既知の VoiceInputButton 2 エラーのみ(§9) |
| Metro バンドル(`expo export --platform android`) | 成功(新アーキ + reanimated 4 worklets 解決確認) |
| `expo prebuild --clean` + `pod install` | 成功 |
| **実機 dev-client ビルド/起動** | **iOS(iPhone 16 sim)/ Android(Pixel 9 / API 35)とも成功**(2026-06-13。下記 iOS 修正7・8 を適用後) |

### 対応が必要だった点

1. **クリーン install は ERESOLVE 0 件**: §11 で「react 19.1 で再衝突しうる」と予告していたが、`.npmrc` なし・`legacy-peer-deps=false` のデフォルト `npm install` が exit 0 / 脆弱性 0 件で成功。expo-router 6 / react 19.1 の組合せでピア衝突は発生しなかった。`.npmrc` は復活させていない。
2. **`react-native-worklets@0.5.1` を明示依存に追加**: reanimated 4.1.x の必須ピア。無いと podspec 検証が失敗する。
3. **babel.config.js から `react-native-reanimated/plugin` を削除**: SDK 54 の babel-preset-expo が reanimated/worklets プラグインを自動設定する。明示指定すると「plugin moved to react-native-worklets」警告 + 重複の原因になるため presets のみ残した。
4. **`babel-preset-expo@~54.0.11` を devDependency に明示追加**: SDK 54 では babel-preset-expo が `expo/node_modules` 配下にネストされ、トップレベルの babel.config.js から `Cannot find module 'babel-preset-expo'` で Metro バンドルが失敗した。直接依存化でトップレベル配置にして解決。
5. **`expo-system-ui@~6.0.9` を追加**: prebuild が「userInterfaceStyle: Install expo-system-ui」と助言。app.json の `userInterfaceStyle: "light"`(ライト固定)を Android で効かせるために必要。追加後に助言は解消。
6. **typescript を ~5.9.2 へ**(expo 推奨)。`expo install typescript` が dependencies 側に二重登録したため、devDependencies 側に一本化(5.9.3 解決)。
7. **【iOS 実機ビルド】static frameworks の非モジュラヘッダ対処(config plugin 新規)**: `useFrameworks: "static"`(Firebase 要求)下で react-native-maps 等の Pod が React のヘッダを非モジュラ include し、`-Werror` により `include of non-modular header inside framework module 'react_native_maps.AIRMap' ... RCTComponent.h` で xcodebuild が code 65 失敗。`plugins/withNonModularHeaders.js`(`withDangerousMod`)を**新規作成**し、生成される ios/Podfile の post_install で全 Pod ターゲットに `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES` を付与、`app.config.ts` の plugins に登録。Podfile は CNG で再生成されるため config plugin 化が必須(手編集は prebuild で消える)。参考: expo/expo#39607。
8. **【iOS 実機ビルド】`buildReactNativeFromSource: true` を追加**: 7 の解決後、AirGoogleMaps で `declaration of 'RCTViewManager' must be imported from module ... before it is required` が発生。SDK 54 の高速 iOS ビルド機能(RN プリコンパイル済みバイナリ + 明示モジュール)と static frameworks の組合せによる**既知問題**(expo/expo#39233、Expo チームが修正作業中)。Expo 公式の暫定対処に従い `expo-build-properties.ios` に `buildReactNativeFromSource: true` を追加(RN をソースビルド)。初回 iOS ビルドは大幅に長くなるが両 OS で起動成功。**Expo 側修正後は撤去して高速ビルドへ戻せる**。代替策として react-native-maps を 1.26.x へ更新する手もあるが、Expo 推奨版(1.20.1)から外れ `expo install --check` 抑制が必要なため非採用。

> **教訓**: 7・8 は静的検証(`expo export` の Metro バンドル / `prebuild` の config 生成)では**検出されず**、実機 dev-client ビルド(xcodebuild)で初めて顕在化した。SDK アップグレードの「完了」判定にはネイティブビルド+実機起動まで含める必要がある。Android はこの問題と無関係(別ビルドシステム)で、JDK 17 で素直にビルド成功(`BUILD SUCCESSFUL 6m46s`)。

### overrides 棚卸し(§7 の再評価)

upgrade 後に overrides を全撤去して `npm install` + `npm audit` した実証結果に基づき判定:

| 対策 | SDK 54 での状況 | 判定 |
|---|---|---|
| overrides `uuid ^11.1.1` | xcode@3.0.1 が今も `uuid ^7.0.3` 固定。7.0.3 は **GHSA-w5hq-g745-h8pq**(v3/v5/v6 の buffer 境界チェック欠落)に該当 | **維持** |
| overrides `postcss ^8.5.10` | @expo/metro-config@54.0.16 が `~8.4.32` 固定 → 8.4.49 解決だが**新しい** advisory **GHSA-qx2v-qp2m-jg93**(PostCSS XSS、≥8.5.10 必要)に該当 | **維持** |
| overrides `expo-dev-launcher > ajv ^8.18.0` | expo-dev-launcher@6.0.21 が固定 `8.11.0` → **範囲 `^8.11.0`** に変化。override 無しでも 8.20.0(安全)に自然解決し audit に出現せず | **撤去**(no-op 化) |

撤去後の最終 overrides は `uuid` + `postcss` の 2 件。撤去前は 17 件の moderate(上記 2 advisory のカスケード)、撤去後 `npm audit` 0 件を確認。

### ネイティブ再生成の検証(prebuild --clean 後)

- `newArchEnabled=true` が android/gradle.properties と ios/Podfile.properties.json の両方に伝播
- `edgeToEdgeEnabled=true` / `expo.edgeToEdgeEnabled=true`(SDK 54 で Android 強制)
- android/app/google-services.json 配置 + google-services gradle プラグイン適用
- AndroidManifest に Maps API キー + 位置情報権限(FINE / COARSE)
- iOS: ios/jNavi/GoogleService-Info.plist 取り込み、AppDelegate.swift に FirebaseApp.configure + firebaseauth reCAPTCHA openURL ガード、static frameworks、`pod install` 成功
- GoogleService-Info.plist / google-services.json はルートに配置済み(.gitignore 対象、ローカル保管必須 — §11 と同じ)

### 実機起動確認(2026-06-13 実施、両 OS OK)

dev-client ビルド + 実機(シミュレータ/エミュレータ)起動を実施し、**両 OS とも起動成功**:

- ✅ **iOS(iPhone 16 sim)**: 上記 iOS 修正7・8 適用後にビルド成功・起動(ユーザー確認済み)
- ✅ **Android(Pixel 9 / API 35)**: `BUILD SUCCESSFUL`(JDK 17 使用)、`com.syumeikyo.jNavi` インストール・起動。**edge-to-edge 正常**(ステータスバーと本文の被りなし)、店舗情報登録フォーム(テキスト入力・トグル・チェックボックス・展開パネル)の描画と入力を画面で確認(ユーザー確認済み)
- ℹ️ Android 起動直後に `Unable to activate keep awake`(`expo-keep-awake`)の LogBox エラーが出るが、**Expo が dev 中に自動有効化する keep-awake の起動レースによる良性エラー**。アプリコードは未使用、プロセスはクラッシュせず(`FATAL EXCEPTION` 無し)、**本番ビルドには出ない**。Dismiss で問題なし
- Metro は 1 インスタンス(8081)で iOS/Android 両 dev-client に同時配信できる(`adb reverse tcp:8081 tcp:8081`)。同時起動可

### 起動後の機能 QA(継続。New Architecture 重点)

起動は通ったので、残りは画面操作での機能確認。**Fabric レンダリング・ネイティブ interop は実機操作でのみ検証可能**。以下を重点確認:

- [ ] **地図(react-native-maps 1.20.1)**: タイル表示・現在地・マーカー・StoreInfoBottomSheet(新アーキ最重要機能)
- [x] ~~**react-native-modal 14.0.0-rc.1**~~: **SDK 55 §13 で未 import の孤立依存と判明し削除済み**(QA 不要に)。実際のモーダルは react-native-paper の `Modal`/`Portal`、シートは @gorhom/bottom-sheet
- [ ] **react-native-element-dropdown 2.12.4**: 表示・選択(JS ベースだが新アーキ要確認)
- [ ] **@gorhom/bottom-sheet 5.x**: ジェスチャ・スナップ(reanimated 4 / gesture-handler 2.28 連携)
- [ ] reanimated 由来アニメーション全般(react-native-paper のリップル等)
- [ ] **edge-to-edge**: 画面上下端のセーフエリア、ステータスバー/ナビゲーションバーへのコンテンツ被り(必要なら app.json に `androidNavigationBar.enforceContrast` 追加)
- [ ] **ライトモード固定**: expo-system-ui 追加後、Android をダークモード端末で起動してもライト表示が維持されること
- [ ] 位置情報許可フロー(expo-location 19)・画像表示(expo-image 3、ExpoImage を image_upload.tsx / StoreInfoBottomSheet.tsx で使用)
- [ ] Google ログイン / Firebase Auth(@react-native-firebase 22 / google-signin 13 の新アーキ動作)
- [ ] dev ビルドの Maps 認可は §11 同様 `android/app/debug.keystore` の SHA-1 を Google Cloud Console に登録要(リリース署名は別途)。ローカルバックエンドは Docker PostgreSQL(ポート 5433)
- 既知の VoiceInputButton 2 エラー(§9)は本タスク対象外で未解消のまま

## 13. 実施記録(SDK 54 → 55、2026-06-13、ブランチ feature/expo-sdk55-upgrade)

§6 のステップ5(54→55)。New Architecture は SDK 54 で移行済みのため SDK 55 の「新アーキ必須化」は前提クリア。今回の山は New Arch ではなく **(A) @expo/config-plugins の hoist 問題** と **(B) react-native-maps の Google Maps 統合方式変更** の 2 点で、いずれも JS/ネイティブ設定の静的検証(prebuild + pod install)で顕在化した。

### 到達状態

| 項目 | 結果 |
|---|---|
| expo / react-native / react / react-dom | 55.0.26 / 0.83.6 / 19.2.0 / 19.2.0 |
| expo-router / reanimated / worklets | 55.0.16 / 4.2.1 / 0.7.4 |
| gesture-handler / screens / safe-area-context | 2.30.1 / 4.23.0 / 5.6.2 |
| @types/react / typescript | 19.2.17 / 5.9.3 |
| react-native-maps | **1.20.1 → 1.27.2**(Expo 推奨が更新。iOS 統合方式が変わり対応が必要だった。下記3) |
| babel-preset-expo(devDep) | ~55.0.8(解決 55.0.22) |
| アーキテクチャ | **New Architecture**(app.json の `newArchEnabled` は SDK 55 で廃止 → 削除。prebuild が gradle.properties / Podfile.properties.json に引き続き `newArchEnabled=true` を書き出すため有効のまま。下記2) |
| Android target/compile/minSdk | **36 / 36 / 24**(expo-modules-core 既定。SDK 54 の target 35 から **36** へ引き上げ = Google Play の次期要件先取り) |
| edge-to-edge | **有効維持**(`edgeToEdgeEnabled=true`) |
| npm audit | **0 件** |
| `npx expo install --check` / `npx expo-doctor` | 最新一致 / **19/19 全合格**(SDK 54 の 18/18 から検査項目が 1 増。新設の config schema チェックで下記2 を検出) |
| `tsc --noEmit` | 既知の VoiceInputButton 2 エラーのみ(§9)。SDK 55 化による新規型エラーなし(React 19.2 / RN 0.83) |
| Metro バンドル(`expo export --platform android`) | 成功 |
| `expo prebuild --clean` + `pod install` | **成功**(`react-native-maps/Google` subspec + GoogleMaps 9.4.0 / Google-Maps-iOS-Utils 6.1.0 解決を Podfile.lock で確認) |
| **実機 dev-client ビルド/起動** | **未実施**(ユーザー実施分。下記チェックリスト) |

### 対応が必要だった点

1. **【最重要・SDK 55 固有】クリーンインストールが必須(@expo/config-plugins の hoist 問題)**: in-place の `npx expo install expo@^55 --fix` 直後、`@expo/config-plugins@55.0.10` が `node_modules/expo/node_modules/` 配下にネストされたまま **top-level に hoist されなかった**。このため `@react-native-firebase/app` の config plugin(`require('@expo/config-plugins')`)と自作 `plugins/withNonModularHeaders.js`(`require('@expo/config-plugins/build/utils/generateCode')` の deep import)が **どちらも MODULE_NOT_FOUND** となり、`expo install --check` で「Skipping config plugin check: Unable to resolve a valid config plugin for @react-native-firebase/app」が出た(prebuild も同根で失敗する状態)。`rm -rf node_modules package-lock.json && npm install` の **クリーンインストールで lockfile を再生成すると top-level に hoist** され、firebase plugin / 自作 plugin の両方が解決(`require.resolve` で実証)。**教訓: SDK 本体メジャー更新では in-place の --fix 後に lockfile を一度再生成すること**(in-place 更新は旧ツリーの nest 構造を引きずる)。
2. **`newArchEnabled` プロパティの削除**: SDK 55 で New Architecture が唯一のアーキテクチャになり、app.json の config schema から `newArchEnabled` が**廃止**された。expo-doctor の新設チェック(19番目「Check Expo config schema」)が `should NOT have additional property 'newArchEnabled'` で fail。app.json から該当行を削除して 19/19。**新アーキは無効化されず**、prebuild が gradle.properties(`newArchEnabled=true`)と Podfile.properties.json に引き続き書き出す(必須なので既定 on)。
3. **【最重要】react-native-maps 1.27.2 の Google Maps 統合方式変更(iOS `pod install` 失敗)**: react-native-maps は別個の `react-native-google-maps.podspec` を**廃止**し、単一 `react-native-maps.podspec` の `Google` subspec(`react-native-maps/Google`、GoogleMaps 9.4.0 + Google-Maps-iOS-Utils 6.1.0 依存)へ統合した。一方 Expo 組み込みの maps フォールバック(`@expo/config-plugins/build/ios/Maps.js` の `withMaps`)は**今も廃止済みの `pod 'react-native-google-maps'` を生成**するため、`pod install` が **`No podspec found for react-native-google-maps`** で失敗した。
   - **原因の特定**: Expo は `@expo/cli` 配下 prebuild-config の `unversioned/react-native-maps.js` で `createLegacyPlugin({ packageName: 'react-native-maps', fallback: [...withMaps...] })` を適用する。これは `withStaticPlugin` で **plugins 配列に明示登録された react-native-maps プラグインを探し、無ければ fallback(旧 withMaps)を使う + `createRunOncePlugin` で dedup** する設計。本プロジェクトは react-native-maps を plugins 配列に未登録だったため fallback(旧 pod 行)が走っていた。
   - **対処**: react-native-maps 1.27.2 が**同梱する公式 config plugin**(`app.plugin.js`)を `app.config.ts` の plugins 配列に明示登録し、`iosGoogleMapsApiKey` / `androidGoogleMapsApiKey` を props で渡した。結果、(1) Podfile に正しい `pod 'react-native-maps/Google', :path => rn_maps_path`、(2) iOS Info.plist の `GMSApiKey`、(3) AppDelegate の `GMSServices.provideAPIKey`(`#if canImport(GoogleMaps)` ガード付き)、(4) AndroidManifest の `com.google.android.geo.API_KEY` を生成。**run-once dedup により Expo 組み込みフォールバックがスキップ**され旧 pod 行は消滅。`pod install` 成功(141 pods)。
   - 注: `app.config.ts` の `ios.config.googleMapsApiKey` / `android.config.googleMaps.apiKey` は維持(フォールバックが skip される限り無害。万一の保険)。API キーは `GOOGLE_MAPS_API_KEY`(.env / EAS 環境変数)。**PR レビュー指摘で `EXPO_PUBLIC_` を除去**(ビルド時のみ参照され JS バンドルに混入しないため。下記「Maps API キーの env 変数から `EXPO_PUBLIC_` を除去」節)。

### overrides 棚卸し(§7 の再評価。全撤去 → クリーン install → audit 実証)

| 対策 | SDK 55 での状況 | 判定 |
|---|---|---|
| overrides `uuid ^11.1.1` | xcode@3.0.1 が今も `uuid ^7.0.3` 固定 → 7.0.3 は **GHSA-w5hq-g745-h8pq** 該当。override 撤去で 12 件 moderate(全て uuid 単一カスケード) | **維持** |
| overrides `postcss ^8.5.10` | `@expo/metro-config@55.0.23` が追従し postcss が **8.5.15** に自然解決(GHSA-qx2v-qp2m-jg93 の閾値 8.5.10 以上で安全)。override 無しでも audit に出現せず | **撤去**(no-op 化) |

撤去後の最終 overrides は **`uuid` の 1 件のみ**(SDK 54 は uuid + postcss の 2 件)。撤去後 `npm audit` **0 件** を確認。**※その後、セキュリティではなく EAS の `npm ci` 対策として `@react-native-async-storage/async-storage` の override を 1 件追加した(理由は下記「EAS Build/Update の npm ci 失敗」節)。最終的な overrides は `uuid` + `async-storage` の 2 件。**

### 不使用依存の削除(react-native-modal)

§5 で「新アーキで最も懸念」とした **react-native-modal@14.0.0-rc.1**(更新停止 RC)を精査したところ、**ソースから一度も import されていない孤立依存**だった。3 系統で実証:

- `npm ls react-native-modal` → 直接依存のみで他パッケージからの **transitive 依存なし**
- 全リポジトリ文字列検索 → ヒットは `package.json` / `package-lock.json` / 本ドキュメントのみ。**`.ts`/`.tsx`/`.js`/`.jsx` に出現ゼロ**
- git 全履歴(`-S` pickaxe)→ `src/` で react-native-modal が登場したコミット**ゼロ**。`c3345b4`【第二形態】MAP画面一旦完了 で package.json に追加されたが import 痕跡は皆無

MAP 画面開発時に追加したものの、実際のモーダル UI は **react-native-paper の `Modal` + `Portal`**(`StoreInfoBottomSheet.tsx` の画像拡大モーダル)と **@gorhom/bottom-sheet**(店舗情報シート)で実装され、本パッケージは未使用のまま残っていた。未 import パッケージは Metro バンドルに含まれず実行もされないため、「新アーキで最も懸念」は**実体の無い懸念**だった。

したがって代替への移行ではなく **`npm uninstall react-native-modal` で削除**(唯一の連れ依存 react-native-animatable も自動 prune、計 2 パッケージ除去)。削除後の静的検証は全 green: **npm audit 0 / expo-doctor 19/19 / expo install --check 最新一致 / tsc 既知の VoiceInputButton 2 件のみ**。これで SDK 55 ブランチは overrides も依存も一段クリーンになった。

### EAS Build/Update の npm ci 失敗(@firebase/auth の async-storage ピア × npm バージョン差異)

**症状**: ローカルは全 green なのに EAS(`Running "npm ci --include=dev" in /home/expo/workingdir/build/`)が `npm error code EUSAGE` →「`Missing: @react-native-async-storage/async-storage@1.24.0 from lock file`」(2 行)で失敗。`npm ci` は package.json と lock の不整合があると install せず止まる。`1.24.0` はルートが宣言する **2.2.0 とは無関係な 1.x 系**であり、全コミット履歴を見てもルート package.json が 1.24.0 を宣言したことは一度もない(常に 2.x)→ **transitive/peer 由来**と判明。

**根本原因 = npm バージョン差異**。`@react-native-firebase/app` → `firebase@11.10.0` → `@firebase/auth@1.10.8`(および `@firebase/auth-compat`)が **optional peer** として `@react-native-async-storage/async-storage: "^1.18.1"` を宣言している(lock 上 `peerDependenciesMeta.optional: true`)。ルートは 2.2.0 で `^1.18.1` を満たさない = **未充足の optional peer**。

- **ローカル npm 11.7.0**(Node 22.13.0 は本来 npm 10.9.2 同梱だが手動で 11 に更新済み)は、未充足の optional peer を**ネストせず**放置 → lock に 1.x のネスト entry 無し → ローカル `npm ci` は通る。
- **EAS クラウドの npm 10.x** は同じ peer を満たそうと `node_modules/firebase/...` と `node_modules/@firebase/auth-compat/...` に **async-storage@1.24.0(1.x 最新)をネスト**しようとする → npm 11 製の lock にその entry が無い → `npm ci` が「Missing」(2 か所ぶんで 2 行)で落ちる。

`npx npm@10.9.2 ci --include=dev --dry-run` で **EAS と同一エラーをローカル再現**、npm 11 では再現しないことを確認し npm バージョン差異と断定した。

**なぜ再発したか**: SDK 54 の `3c0e560` はこの同じエラーを **lock に 28 行を手追加**(上記 2 か所の async-storage@1.24.0 ネスト entry)して凌いでいた。しかし SDK 55 のクリーン再 install(npm 11)が lock を再生成し、その手追加分を**消した**ため再発。**lock の手パッチは clean install で必ず飛ぶ = 非永続**。§11(SDK 53)で「`peerOptional` だから overrides 不要」とした判断は**ローカル前提では正**だが、**EAS の npm 10 がそれをハード失敗に変える**点を見落としていた。

**恒久対策(採用)**: package.json の overrides に下記 1 行を追加。

```json
"@react-native-async-storage/async-storage": "$@react-native-async-storage/async-storage"
```

`$<dep>` 参照でルート宣言版(= 2.2.0)に固定され、**どの npm バージョンでも 1.x をネストしなくなる**(npm 10 は ci 時に package.json の overrides を読んで 1.24.0 を要求しなくなる)。package.json 宣言なので **clean install でも消えない = 永続**。`$` 参照のため将来 SDK で async-storage が上がっても**自動追従**(固定値ハードコードでない)。アプリの認証は `@react-native-firebase`(ネイティブ)で行い JS SDK の async-storage 永続化経路は使っていないため、この固定は機能的に無害。

**検証**: 追加後 `npx npm@10.9.2 ci --include=dev --dry-run`(= EAS 相当)が **Missing 消失で成功**、`npm ci`(npm 11)も成功、`npm audit` **0** / `expo-doctor` **19/19**。override は解決ツリーに対し no-op(async-storage は元から 2.2.0 単一)のため **lock 不変・node_modules 不変** = 差分は **package.json の 1 行のみ**。EAS は push 済み ref をビルドするので、本修正は **commit + push して初めて反映**される。(2026-06-14 に `8141a1e` として commit + push 済み)

### Maps API キーの env 変数から `EXPO_PUBLIC_` を除去(PR レビュー対応)

PR の Gemini レビューで「`EXPO_PUBLIC_` 変数はビルド時に JS バンドルへインライン化される」指摘。検証の結果、**Maps キーは `src/` から一切参照されず `app.config.ts`(ビルド時の native 設定生成)専用**だった(対照的に Google クライアント ID は `src/config/google.ts` の `GoogleSignin.configure` に渡るため runtime 必須 → `EXPO_PUBLIC_` のまま維持)。よって `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` → **`GOOGLE_MAPS_API_KEY`** にリネーム(`app.config.ts` 4 箇所 / `.env` / `.env.example` / `env.d.ts` / `README.md`)。

- 正確には `EXPO_PUBLIC_` のインライン化は**バンドルされる JS 内の参照箇所**で起きる。`app.config.ts` はビルド時に Node 評価されバンドル外なので、参照ゼロの現状では **JS バンドルへの実害は無い**。本変更は将来 `src/` で誤って参照した際の自動インライン化(footgun)除去 + build-time 秘密である明示。
- **EAS 環境変数も同名にリネーム必須**(非 `EXPO_PUBLIC_` でも EAS ビルド時には渡るため native 設定生成は問題なし。忘れると fallback `YOUR_FALLBACK_KEY` で地図が出ない)。ローカルも `.env` をリネームするまでは fallback になる。
- **本質的な防御は不変**: Maps キーは prefix に関わらず `Info.plist` の `GMSApiKey` / `AndroidManifest` の `geo.API_KEY` 経由でネイティブバイナリに必ず埋め込まれ抽出可能。実セキュリティの本丸は **Google Cloud Console の API キー制限**(iOS bundle ID / Android package + SHA-1 + Maps SDK 限定)。§11 記載どおり Android 制限が外れる事象があるため要確認。

### iOS 静的フレームワーク修正(SDK 54 §12 の7・8)の SDK 55 での扱い

| 修正 | SDK 55 での扱い |
|---|---|
| `plugins/withNonModularHeaders.js`(config plugin) | **維持**。クリーン install で `@expo/config-plugins` が hoist された後は deep import が解決し、Podfile post_install への `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES=YES` 注入を確認 |
| `expo-build-properties.ios.buildReactNativeFromSource: true`(expo/expo#39233 回避) | **維持(要再評価)**。`pod install` は成功するが、#39233 の AirGoogleMaps コンパイルエラーは **実機 xcodebuild でのみ顕在化**するため当環境では SDK 55 + react-native-maps 1.27.2 で撤去可能かを判定不能。実機 iOS ビルド時に **一度 `buildReactNativeFromSource` を外して**高速ビルドが通るか試し、通れば撤去(初回ビルドが大幅短縮) |

### ネイティブ再生成の検証(prebuild --clean 後)

- `newArchEnabled=true` / `edgeToEdgeEnabled=true` が android/gradle.properties に伝播。Podfile.properties.json に `ios.useFrameworks: static` / `ios.buildReactNativeFromSource: true`
- Podfile に `pod 'react-native-maps/Google'`(正)+ withNonModularHeaders の post_install 注入。Podfile.lock に GoogleMaps 9.4.0 / Google-Maps-iOS-Utils 6.1.0 / react-native-maps/Google 1.27.2
- iOS AppDelegate に GoogleMaps init + firebaseauth reCAPTCHA openURL ガード(@react-native-firebase/auth)。Info.plist に GMSApiKey
- AndroidManifest に Maps geo API_KEY + 位置情報権限。android/app/google-services.json 配置
- GoogleService-Info.plist / google-services.json はルートに配置済み(.gitignore 対象、ローカル保管必須 — §11・§12 と同じ)

### 残作業: 実機 dev-client ビルド + 機能 QA(ユーザー実施)

静的検証(audit 0 / doctor 19/19 / tsc / Metro export / prebuild + pod install)は全 green。SDK 54 §12 の教訓どおり「完了」判定には実機ビルド + 起動 + Fabric 操作確認が必須。重点:

- [ ] **iOS dev-client ビルド/起動**(`npx expo run:ios`)。`buildReactNativeFromSource` を外して試行 → 通れば撤去(上表)
- [ ] **Android dev-client ビルド/起動**(`npx expo run:android`、JDK 17 必須。RN 0.83 でも JDK 17。target 36 化に伴う Gradle/AGP 警告の有無)
- [ ] **地図(react-native-maps 1.27.2)**: タイル表示・現在地・マーカー・StoreInfoBottomSheet。**maps メジャー更新(1.20→1.27)のため最重点**。dev ビルドの Maps 認可は `android/app/debug.keystore` の SHA-1 を Google Cloud Console に登録要(§11・§12 同様)
- [ ] element-dropdown 2.12.4 / @gorhom/bottom-sheet 5.2.14(reanimated 4.2.1 / gesture-handler 2.30.1 連携)。**react-native-modal は未使用と判明し削除済み(下記)のため QA 対象外**
- [ ] edge-to-edge / ライトモード固定 / 位置情報許可 / 画像表示(expo-image) / Google ログイン・Firebase Auth
- ローカルバックエンドは Docker PostgreSQL(ポート 5433)
- 既知の VoiceInputButton 2 エラー(§9)は本タスク対象外で未解消のまま

## 14. 実施記録(SDK 55 → 56、2026-06-14、ブランチ feature/expo-sdk56-upgrade)

§6 のステップ6(55→56)。最新安定版 SDK 56(`latest` タグ = 56.0.11。SDK 57 は canary)へ。**コード(`src/`)側の破壊的変更該当はゼロ**で、山は **(A) config schema 変更で `splash` トップレベルプロパティ廃止 → expo-splash-screen plugin 移行** と **(B) TypeScript 6.0 化に伴う `baseUrl` 非推奨エラー** の 2 点。いずれもネイティブ/型の静的検証で顕在化し対応済み。

### SDK 56 破壊的変更の影響調査(コードベースは無傷)

SDK 56 チェンジログの破壊的変更を全件、本プロジェクトの `src/` に対し照合 → **該当ゼロ**:

| SDK 56 の破壊的変更 | 本プロジェクトへの影響 |
|---|---|
| expo-router が React Navigation 非依存化(`@react-navigation/*` 直 import が破壊) | **影響なし**(`@react-navigation/*` の直 import が `src/` に 0 件。codemod 不要) |
| `@expo/vector-icons` が expo 本体の依存から脱落(明示依存が必要) | **対応済**(元から `dependencies` に `@expo/vector-icons` を明示。SDK 56 で 15.1.1 に解決。`expo install --check` も最新一致。なお `@react-native-vector-icons/*` への移行が非推奨案内されるが任意で、現状維持で動作) |
| expo-file-system の copy/move が async 化(`copySync`/`moveSync` 別途) | **影響なし**(`copyAsync`/`moveAsync`/`.copy`/`.move` の使用が `src/` に 0 件) |
| expo/fetch が `globalThis.fetch` 既定化(WinterTC 準拠) | **影響なし**(直接 `fetch(` 使用 0 件。通信は axios で RN の XHR アダプタ経由。opt-out は `EXPO_PUBLIC_USE_RN_FETCH=1`) |
| @expo/dom-webview が WebView 既定化(react-native-webview 不要) | **影響なし**(react-native-webview 未使用) |
| iOS/tvOS 最小 16.4(15.1 から) / **最小 Xcode 26.4** / macOS 最小 13.4 | iOS deployment target は prebuild が自動で 16.4 に。**Xcode 26.4 要件は要注意**(下記「残作業」。ローカル Xcode は 26.1.1) |
| Hermes v1 既定 / 新アニメーションバックエンド | 透過的(`expo export` で Hermes バイトコード `.hbc` 出力を確認) |
| TypeScript 6.0.3 をテンプレート同梱 | 追従(下記2) |
| Node.js 最小 v20.19.4 | ローカル v22.13.0 で充足 |

### 到達状態

| 項目 | 結果 |
|---|---|
| expo / react-native / react / react-dom | 56.0.11 / 0.85.3 / 19.2.3 / 19.2.3 |
| expo-router / reanimated / worklets | 56.2.10 / 4.3.1 / **0.8.3**(SDK 55 は 0.7.4) |
| gesture-handler / screens / safe-area-context | 2.31.2 / 4.25.2 / 5.7.0 |
| @types/react / typescript | 19.2.17 / **6.0.3**(SDK 55 の 5.9.3 から **メジャー更新**。下記2) |
| react-native-maps | 1.27.2(SDK 55 から据え置き。iOS 統合方式は §13 の対処を継続) |
| **expo-splash-screen** | **~56.0.10 を新規追加**(splash 移行のため。下記1) |
| babel-preset-expo(devDep) | ~56.0.0(解決 56.0.15) |
| @expo/vector-icons | 15.1.1(expo 本体の依存から脱落 → 明示依存を維持) |
| アーキテクチャ | New Architecture(SDK 54 以降。`newArchEnabled=true` を prebuild が gradle.properties に書き出し) |
| Android target/compile/minSdk | **36 / 36 / 24**(expo-modules-core 既定。SDK 55 と同値。`android/build.gradle` は `expo-root-project` plugin 経由に簡素化され ext 定義が消えた) |
| iOS deployment target | **16.4**(SDK 55 の 15.1 から引き上げ。Podfile の `platform :ios, ... || '16.4'`) |
| edge-to-edge | 有効維持(`edgeToEdgeEnabled=true`) |
| npm audit | **0 件** |
| `npx expo install --check` / `npx expo-doctor` | 最新一致 / **21/21 全合格**(SDK 55 の 19/21 → 検査項目が 2 増。新設 schema チェックが下記1 を検出) |
| EAS 相当 `npx npm@10.9.2 ci --include=dev --dry-run` | **成功**(Missing エラーなし。async-storage override が継続して効く。下記overrides節) |
| `tsc --noEmit` | TS 6.0 化後も既知の VoiceInputButton 2 エラーのみ(§9)。SDK 56 / TS 6 / React 19.2.3 / RN 0.85 による**新規型エラーなし** |
| Metro バンドル(`expo export --platform android`) | 成功(Hermes v1 既定化で `.hbc` バイトコード 5.7MB を出力) |
| `expo prebuild --clean` + `pod install` | **成功**(`react-native-maps/Google` subspec + GoogleMaps 9.4.0 / Google-Maps-iOS-Utils 6.1.0、withNonModularHeaders 注入、splash リソース生成を確認) |
| **iOS dev-client ビルド(シミュレータ)** | **成功**(iPhone 16 Pro / iOS 18.4 シミュレータ、`expo run:ios` が **Build Succeeded / 0 error / 24 warning**。`buildReactNativeFromSource` 撤去版で precompiled RN ビルド。下記7) |
| **Android dev-client ビルド/起動** | **未実施**(ユーザー実施分。下記チェックリスト) |
| **両 OS 機能 QA** | **未実施**(ユーザー実施分。アプリ起動・地図・splash 等。下記チェックリスト) |

### 対応が必要だった点

1. **【最重要・SDK 56 固有】`splash` トップレベルプロパティ廃止 → expo-splash-screen plugin へ移行**: SDK 56 の config schema から `app.json` トップレベルの `splash` が**廃止**され、expo-doctor の schema チェックが `should NOT have additional property 'splash'` で fail(20/21)。SDK 56 では splash は **expo-splash-screen の config plugin** 経由で設定する方式が正(legacy トップレベルは将来削除予定で SDK 56 で schema reject)。
   - **expo-splash-screen は SDK 56 で expo 本体の依存から脱落**(expo の dependencies に splash 系は無く `expo-asset` のみ)していたため、`npx expo install expo-splash-screen`(→ ~56.0.10)で**明示追加**。
   - 従来の `app.json` の splash 設定(`image: ./assets/splash-icon.png` / `resizeMode: contain` / `backgroundColor: #ffffff`)を **app.config.ts の plugins に `["expo-splash-screen", {...}]` として忠実に移植**し、`app.json` のトップレベル `splash` ブロックを削除。再 doctor で **21/21**。prebuild で Android `colors.xml` に `splashscreen_background #ffffff` + `splashscreen_logo` リソース生成を確認。
   - 注: legacy トップレベル splash は**全画面 contain**、新 plugin は**中央配置 + imageWidth(既定 100px)**が基本モデルで、`resizeMode: contain` 指定時の見え方が変わりうる。**splash の見栄えは実機 QA 項目**(下記)。
2. **SDK 56 で expo-asset / expo-image / expo-status-bar が config plugin を持つ → plugins 配列へ明示登録**: `expo install --fix` が動的設定(app.config.ts)へ自動追記できず「Add the following to your Expo config: expo-asset / expo-image / expo-status-bar」を出す(これにより `--fix` は exit 1 で終了するが、依存の npm install 自体は完了済み)。いずれも一級 Expo プラグイン(ネイティブのアセット埋め込み・画像・ステータスバー設定を prebuild に適用)で、SDK 56 テンプレート整合のため app.config.ts に**文字列プラグインとして追加**。
3. **TypeScript 6.0 化に伴う `baseUrl` 非推奨エラー(TS5101)**: SDK 56 は TS 6.0.3 を採用。TS 6.0 で `baseUrl` が**非推奨**(TS 7.0 で廃止予定)になり、未対処だと **tsc が TS5101 設定エラーで停止**(プログラム本体の型チェックに到達せず、既知の VoiceInputButton 2 エラーすら出ない)。
   - 本プロジェクトの `tsconfig.json` は `baseUrl: "."` + `paths`(`@/*`, `~/*`)。`@/` は 27 ファイルで使用、`~/` は未使用(0 件)。**babel.config.js に module-resolver は無く、metro.config.js も無い** → `@/` エイリアスの**バンドラ解決は babel-preset-expo が tsconfig の baseUrl + paths を参照**して行っている。
   - したがって **baseUrl を削除するとバンドラのエイリアス解決が変わるリスク**がある。TS 6.0 のエラーメッセージ自身が推奨する **`"ignoreDeprecations": "6.0"`** を tsconfig に追加(baseUrl はそのまま維持 = tsc・バンドラ双方の解決挙動を一切変えないゼロリスク対応)。再 tsc で**既知の 2 エラーのみ**に復帰。**baseUrl 撤去は TS 7.0 移行時にバンドラ検証込みで対応する**(別タスク)。
4. **クリーンインストール(SDK 55 §13-1 の教訓を踏襲)**: in-place の `expo install expo@^56 --fix` 後、`rm -rf node_modules package-lock.json && npm install` で lockfile を再生成。`@expo/config-plugins`(56 系)が top-level に hoist され、firebase plugin / 自作 `withNonModularHeaders` の deep import が解決することを `require.resolve` で実証(`expo install --check` の config plugin check skip 警告なし)。**メジャー更新では in-place --fix 後に必ず lockfile 再生成**。

### overrides 棚卸し(§7 の再評価)

| 対策 | SDK 56 での状況 | 判定 |
|---|---|---|
| overrides `uuid ^11.1.1` | `xcode@3.0.1` が今も `uuid ^7.0.3` 固定(7.0.3 は GHSA-w5hq-g745-h8pq)。override で 11.1.1 に解決(`npm ls uuid` で実証) | **維持** |
| overrides `@react-native-async-storage/async-storage`(`$` 参照) | `firebase@11.10.0 → @firebase/auth@1.10.8`(+auth-compat)が今も optional peer `async-storage ^1.18.1` を宣言(§13 と同一機構)。override で 2.2.0 dedupe。**`npx npm@10.9.2 ci --dry-run`(EAS 相当)が Missing エラーなしで成功** = 引き続き load-bearing | **維持** |

**最終 overrides は SDK 55 から不変**(`uuid` + `async-storage` の 2 件)。撤去候補なし。

### ネイティブ再生成の検証(prebuild --clean 後)

- iOS: `platform :ios, ... || '16.4'`(15.1 から引き上げ)。Podfile に `pod 'react-native-maps/Google'`(正)+ withNonModularHeaders の post_install 注入(`CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES`)。Podfile.lock に GoogleMaps 9.4.0 / Google-Maps-iOS-Utils 6.1.0 / react-native-maps/Google 1.27.2。Info.plist GMSApiKey に実キー。AppDelegate に firebaseauth reCAPTCHA openURL ガード
- Android: gradle.properties に `newArchEnabled=true` / `edgeToEdgeEnabled=true`。target/compile 36・min 24(expo-modules-core 既定)。AndroidManifest に Maps geo API_KEY(実キー)+ 位置情報権限。android/app/google-services.json 配置。expo-splash-screen の `splashscreen_background #ffffff` リソース生成
- GoogleService-Info.plist / google-services.json はルートに配置済み(.gitignore 対象、ローカル保管必須 — §11〜§13 と同じ)

### 7. `buildReactNativeFromSource: true` の撤去(§13 からの宿題を解消)

SDK 54〜55 で expo/expo#39233(useFrameworks:static + RN プリコンパイル済みバイナリで「must be imported from module ... before it is required」, react-native-maps 等)の回避として `expo-build-properties.ios.buildReactNativeFromSource: true` を入れていた。**SDK 56 + Xcode 26.5 + RN 0.85 で #39233 が解消**したため**撤去**(app.config.ts から削除)。

- 検証: 撤去 → `expo prebuild --clean`(Podfile.properties.json から `ios.buildReactNativeFromSource` が消え `ios.useFrameworks: static` のみ)→ **iPhone 16 Pro / iOS 18.4 シミュレータ向け `expo run:ios` が Build Succeeded / 0 error / 24 warning**(警告は GTMSessionFetcher/AppAuth 等の privacy bundle deployment 不一致やスクリプト依存解析の定番のみで無害)。`react-native-maps` の AirGoogleMaps ヘッダも precompiled framework 経由で正常コンパイル。**#39233 の再現なし**
- 効果: RN をソースからビルドしないため**初回 iOS ビルドが大幅短縮**。再発時のみ `buildReactNativeFromSource: true` を復活する

### 8. 【Xcode 26.5 更新時の gotcha】iOS シミュレータランタイムの再ダウンロードが必須

SDK 56 は **iOS 最小 16.4 / 最小 Xcode 26.4**。ローカル Xcode を 26.1.1 → **26.5** に更新したが、更新直後の `expo run:ios` が **`xcodebuild: error: Unable to find a destination matching the provided destination specifier`** で**コンパイル前に失敗**(#39233 と誤認しやすいが無関係)。

- 原因: Xcode 26.5 の SDK は iOS 26.5 だが、**対応するシミュレータランタイム(iOS 26.5)が未ダウンロード**。`xcrun simctl list runtimes` には旧 Xcode 由来の iOS 18.4 / 26.1 が見えるのに、`xcodebuild -showdestinations` が**シミュレータ destination を 1 つも提示しない**(Ineligible な「Any iOS Device」のみ、`iOS 26.5 is not installed. Please download and install the platform from Xcode > Settings > Components.`)。新 Xcode は旧ランタイムをそのままでは使えない
- 対処: **`xcodebuild -downloadPlatform iOS`**(sudo 不要、iOS 26.5 Simulator ランタイム約 8.5GB をダウンロード+インストール)。完了後 `xcrun simctl list runtimes` に iOS 26.5 が出現し、`-showdestinations` が 18.4/26.1/26.5 全シミュレータを提示 → ビルド成功。GUI なら Xcode > Settings > Components から同等
- 初回起動セットアップ(`sudo xcodebuild -license accept && sudo xcodebuild -runFirstLaunch`)も Xcode 更新後に必須

### 残作業: 実機 dev-client ビルド + 機能 QA(ユーザー実施)

静的検証(audit 0 / doctor 21/21 / tsc / Metro export / prebuild + pod install)は全 green。**iOS シミュレータビルドも成功**(上記7)。残る「完了」判定には Android ビルド + 両 OS の起動 + 操作確認が必須。重点:

- [x] **Xcode を 26.4 以上へ更新** → **26.5** に更新済み(iOS シミュレータランタイムの再 DL が必要だった。上記8)。`buildReactNativeFromSource` を外して `expo run:ios` が **Build Succeeded** = 撤去確定(上記7)
- [ ] **iOS アプリ起動後の機能 QA**(ビルド成功済み。シミュレータでアプリ起動 → 下記の地図・splash・ログイン等を操作確認。Metro は 8081 稼働中)
- [ ] **Android dev-client ビルド/起動**(`npx expo run:android`、**JDK 17 必須** — §13 と同様、mac デフォルト JDK では Gradle 失敗。`JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home`)
- [ ] **splash の見栄え**(expo-splash-screen plugin 移行の影響。legacy 全画面 contain → plugin 中央配置で**最重点**。`resizeMode`/`imageWidth` の調整要否を両 OS で確認)
- [ ] **地図(react-native-maps 1.27.2)**: タイル表示・現在地・マーカー・StoreInfoBottomSheet。dev ビルドの Maps 認可は `android/app/debug.keystore` の SHA-1 を Google Cloud Console に登録要
- [ ] element-dropdown / @gorhom/bottom-sheet(reanimated 4.3.1 / gesture-handler 2.31.2 / **worklets 0.8.3** 連携。§13 の WorkletsError gotcha 同様、SDK 跨ぎで Metro を `--clear` 起動)
- [ ] edge-to-edge / ライトモード固定 / 位置情報許可 / 画像表示(expo-image) / Google ログイン・Firebase Auth
- [ ] **SDK 更新後は両 OS とも一度フル再ビルド**(§13 の `Cannot find native module` gotcha。JS リロードでは新規 autolink ネイティブモジュールが増えない)
- ローカルバックエンドは Docker PostgreSQL(ポート 5433)
- 既知の VoiceInputButton 2 エラー(§9)は本タスク対象外で未解消のまま
- **コミット/push はユーザーが実施**(自動コミット禁止の慣例)。EAS は push 済み ref をビルドするため、EAS 利用時は **EAS 環境変数 `GOOGLE_MAPS_API_KEY` の設定済みを確認**(§13)
