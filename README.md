# ippon-nippon.com

IPPON NIPPON PARIS — Reading Wood 公式サイト。静的3ページ + コンタクトフォームAPI。

## 構成

```
index.html      ポスターLP
about.html      About（JP/EN切替）
contact.html    コンタクトフォーム（JP/EN切替）
api/contact.js  フォーム送信 → Resend → メール通知
```

ホスティング: Vercel（静的配信 + Serverless Function）

## セットアップ（残り作業）

1. **Resend**: https://resend.com でアカウント作成 → API Key発行
   - Domains で `ippon-nippon.com` を追加し、表示されるSPF/DKIMレコードをDNSに登録（送信元を`ippon-nippon.com`にする場合）
2. **Vercel 環境変数**（Project Settings → Environment Variables）
   - `RESEND_API_KEY` （必須）
   - `CONTACT_FROM` 例: `IPPON NIPPON <noreply@ippon-nippon.com>`（未設定時は onboarding@resend.dev）
   - `CONTACT_TO` （未設定時は furukawa@887.co.jp）
3. **ドメイン**: Vercel Project Settings → Domains で `ippon-nippon.com` を追加し、
   案内に従いDNSを設定（A `76.76.21.21` / CNAME www `cname.vercel-dns.com`）

## フォーム仕様

- 項目: NAME* / AFFILIATION / EMAIL* / INQUIRY*
- チェック: プライバシーポリシー同意（必須）/ 更新情報の受け取り（任意）
- スパム対策: honeypotフィールド（`website`）
- 送信失敗時はエラーメッセージ表示＋メール窓口を案内
- データはメール中継のみ、どこにも保存されない
