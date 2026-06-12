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

1. **セキュリティ修正(2026-06-12 分)を先にコミット**して切り離す
2. **52 → 53**: React 19 化を吸収。旧アーキのまま可
3. **53 → 54**: RN 0.81、target API 35、Android edge-to-edge 対応。**中間リリース可能地点**(Play 要件もここで解消)
4. **SDK 54 上で `newArchEnabled: true`** に切替え、全画面 QA(地図・モーダル・ドロップダウン・BottomSheet が重点)
5. **54 → 55 → 56**: reanimated 4 等を吸収
6. 完了時に overrides・postinstall シムを棚卸し(§7)

## 7. 現行セキュリティ対策の棚卸し(アップグレード時に撤去・再評価するもの)

2026-06-12 のセキュリティ対応で導入したもの。新 SDK では上流が追従するため、各ステップで `npm ls` / `npm audit` を確認しながら削除する。

| 対策 | 導入理由 | 撤去条件 |
|---|---|---|
| `scripts/patch-tar-cjs-interop.cjs` + postinstall | tar v7 強制により @expo/cli(SDK 52、tar ^6.2.1 固定)の CJS interop が壊れるため | **SDK 54 以降で撤去可**(SDK 54 の CLI は tar ^7.5.2 ネイティブ、SDK 55 以降は node-tar 自体を不使用) |
| overrides: `tar ^7.5.16` | tar 6.x にパッチ版が存在しない | SDK 54 以降で再評価(上流が v7 宣言済み) |
| overrides: `uuid ^11.1.1` | xcode / @expo/bunyan が旧 uuid に依存 | 新 SDK で上流追従を確認後に削除 |
| overrides: `@xmldom/xmldom ^0.8.13` | @expo/plist が ~0.7.7 固定 | 同上 |
| overrides: `postcss ^8.5.10` | @expo/metro-config が ~8.4.32 固定 | 同上 |
| overrides: expo-dev-launcher 配下 `ajv ^8.18.0` | expo-dev-launcher が 8.11.0 完全固定 | 同上 |
| overrides: `brace-expansion ^2.0.2` | 以前のセキュリティ対応 | 同上 |
| 直接依存 `axios ^1.17.0` | 脆弱性対応(公式安全基準 1.16.0+) | 撤去不要(維持) |

## 8. 工数目安

- フル(SDK 56 + New Architecture まで): **集中作業 3〜5 日 + 両 OS 実機 QA**
- 最小(SDK 54 まで、旧アーキ維持): **2 日程度**(サポート・Play 要件は解消、新アーキ移行は次の区切りへ)

## 9. 注意事項

- `src/components/inputs/VoiceInputButton.tsx` が未登録パッケージ `@react-native-voice/voice` を import しており `tsc --noEmit` が常に 2 エラーで失敗する(本調査以前からの既存問題)。アップグレード時の型チェック結果判定ではこの 2 エラーを除外するか、事前に依存登録 or コンポーネント整理で解消しておくこと。

## 10. 参考情報源

- Expo 公式ドキュメント(最新 SDK 構成): https://docs.expo.dev/versions/latest/
- Expo SDK アップグレード手順: https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/
- Google Play target API 要件: https://developer.android.com/google/play/requirements/target-sdk
- npm 公式レジストリ(expo / expo-template-default / @expo/cli の dist-tags・依存関係、2026-06-12 時点)
