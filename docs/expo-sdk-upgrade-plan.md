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
| react-native-modal | 14.0.0-rc.1 | **事実上更新が停止している RC 版**。新アーキで最も懸念。@gorhom/bottom-sheet 等への置換も視野 |
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
5. **54 → 55 → 56**: reanimated 4 等を吸収
6. 完了時に overrides・postinstall シムを棚卸し(§7)

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
- [ ] **react-native-modal 14.0.0-rc.1**: 開閉・アニメーション。§5 で「新アーキで最も懸念」とした**更新停止 RC 版**。崩れる場合は `@gorhom/bottom-sheet` か RN 製 `Modal` への置換を検討
- [ ] **react-native-element-dropdown 2.12.4**: 表示・選択(JS ベースだが新アーキ要確認)
- [ ] **@gorhom/bottom-sheet 5.x**: ジェスチャ・スナップ(reanimated 4 / gesture-handler 2.28 連携)
- [ ] reanimated 由来アニメーション全般(react-native-paper のリップル等)
- [ ] **edge-to-edge**: 画面上下端のセーフエリア、ステータスバー/ナビゲーションバーへのコンテンツ被り(必要なら app.json に `androidNavigationBar.enforceContrast` 追加)
- [ ] **ライトモード固定**: expo-system-ui 追加後、Android をダークモード端末で起動してもライト表示が維持されること
- [ ] 位置情報許可フロー(expo-location 19)・画像表示(expo-image 3、ExpoImage を image_upload.tsx / StoreInfoBottomSheet.tsx で使用)
- [ ] Google ログイン / Firebase Auth(@react-native-firebase 22 / google-signin 13 の新アーキ動作)
- [ ] dev ビルドの Maps 認可は §11 同様 `android/app/debug.keystore` の SHA-1 を Google Cloud Console に登録要(リリース署名は別途)。ローカルバックエンドは Docker PostgreSQL(ポート 5433)
- 既知の VoiceInputButton 2 エラー(§9)は本タスク対象外で未解消のまま
