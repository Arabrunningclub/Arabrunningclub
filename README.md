diff --git a/README.md b/README.md
index 4a2ec3001db97f47fb4cde017f0a122e0c533bcf..b215aa62aaa6d0949500713b1c7b2265364e253b 100644
--- a/README.md
+++ b/README.md
@@ -1 +1,11 @@
-# Arabrunningclub
+# Arabrunningclub
+
+## Environment Variables
+
+Create a `.env.local` file with the following variables to enable the donations page:
+
+- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
+- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
+- `STRIPE_SECRET_KEY`
+
+The Stripe keys are required for card donations, while the PayPal client ID is necessary for PayPal donations.
