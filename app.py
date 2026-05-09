from flask import Flask, request, jsonify
import os
import re
import html as html_lib
import smtplib
import time
from email.message import EmailMessage

app = Flask(__name__)

RATE_LIMIT_WINDOW = 60
RATE_LIMIT_MAX = 5
ip_attempts = {}


# Optional: load .env if python-dotenv is available
try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:
    pass


@app.after_request
def add_cors_headers(response):
    allowed_origins = [
        "https://www.vartisticstudio.com",
        "https://vartisticstudio.com",
        "http://localhost:3000",
        "http://localhost:8080",
    ]
    origin = request.headers.get("Origin", "")
    if origin in allowed_origins or origin == "":
        response.headers["Access-Control-Allow-Origin"] = origin if origin else "*"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    return response


@app.route("/send-mail", methods=["POST", "OPTIONS"])
def send_mail():
    if request.method == "OPTIONS":
        return jsonify(success=True), 200

    client_ip = request.remote_addr
    now = time.time()
    if client_ip in ip_attempts:
        ip_attempts[client_ip] = [
            t for t in ip_attempts[client_ip] if now - t < RATE_LIMIT_WINDOW
        ]
        if len(ip_attempts[client_ip]) >= RATE_LIMIT_MAX:
            return jsonify(
                success=False, error="Too many requests. Please try again later."
            ), 429
        ip_attempts[client_ip].append(now)
    else:
        ip_attempts[client_ip] = [now]

    try:
        data = request.get_json(force=True)
    except Exception:
        data = {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()
    message = (data.get("message") or "").strip()

    if not name or not email or not message:
        return jsonify(success=False, error="Missing required fields"), 400

    if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email):
        return jsonify(success=False, error="Invalid email format"), 400

    GMAIL_USER = os.environ.get("GMAIL_USER")
    GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD")
    RECIPIENT_EMAIL = os.environ.get("RECIPIENT_EMAIL", "vartisticstudio@gmail.com")

    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        return jsonify(success=False, error="Mail credentials not configured"), 500

    source = (data.get("source") or "index").strip().lower()

    safe_name = html_lib.escape(name)
    safe_email = html_lib.escape(email)
    safe_phone = html_lib.escape(phone) if phone else "Not provided"
    safe_message = html_lib.escape(message)
    safe_body_intro = html_lib.escape(
        "Contact Page Submission" if source == "contact" else "Website Enquiry"
    )

    msg = EmailMessage()
    msg["From"] = GMAIL_USER
    msg["To"] = RECIPIENT_EMAIL

    if source == "contact":
        msg["Subject"] = "New Contact Enquiry - Vartistic Studio"
        body_intro = "Contact Page Submission"
    else:
        msg["Subject"] = "New Website Enquiry - Vartistic Studio"
        body_intro = "Website Enquiry"

    phone_display = phone if phone else "Not provided"

    body = f"{body_intro}:\n\nName:\n{name}\n\nEmail:\n{email}\n\nPhone:\n{phone_display}\n\nMessage:\n{message}\n"

    html_body = f"""
    <html>
        <body style="margin:0;padding:20px;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
            <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(16,24,40,0.08);overflow:hidden;">
                  <div style="background:linear-gradient(90deg,#b8860b,#ffd700);padding:20px 24px;color:#fff;">
                    <h1 style="margin:0;font-size:18px;letter-spacing:0.2px">Vartistic Studio</h1>
                    <p style="margin:6px 0 0;font-size:13px;opacity:0.9">{safe_body_intro}</p>
                </div>
                <div style="padding:24px;color:#0f172a;font-size:14px;line-height:1.5">
                    <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin-bottom:16px;">
                        <tr><td style="padding:6px 0;font-weight:600;width:110px;color:#111827">Name</td><td style="padding:6px 0;color:#374151">{safe_name}</td></tr>
                        <tr><td style="padding:6px 0;font-weight:600;color:#111827">Email</td><td style="padding:6px 0;color:#374151">{safe_email}</td></tr>
                        <tr><td style="padding:6px 0;font-weight:600;color:#111827">Phone</td><td style="padding:6px 0;color:#374151">{safe_phone}</td></tr>
                    </table>

                    <div style="margin-top:8px;padding:16px;background:#f8fafc;border-radius:6px;color:#111827;white-space:pre-wrap">{safe_message}</div>
                </div>
                <div style="padding:16px 24px;background:#fcfcfd;border-top:1px solid #eef2f7;font-size:12px;color:#6b7280">
                    <div>— Vartistic Studio</div>
                    <div style="margin-top:6px;color:#9ca3af">Visit <a href="https://www.vartisticstudio.com" style="color:#b8860b;text-decoration:none">vartisticstudio.com</a></div>
                </div>
            </div>
        </body>
    </html>
    """

    msg.set_content(body)
    msg.add_alternative(html_body, subtype="html")

    try:
        SMTP_TIMEOUT = int(os.environ.get("SMTP_TIMEOUT", "10"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=SMTP_TIMEOUT) as smtp:
            smtp.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            smtp.send_message(msg)

            user_email_sent = False
            try:
                if email:
                    confirm = EmailMessage()
                    confirm["From"] = GMAIL_USER
                    confirm["To"] = email
                    if source == "contact":
                        confirm["Subject"] = (
                            "Vartistic Studio - We received your contact enquiry"
                        )
                        note = "Thank you for contacting us via the Contact page."
                    else:
                        confirm["Subject"] = (
                            "Vartistic Studio - We've received your enquiry"
                        )
                        note = "Thank you for your website enquiry."

                    confirm_body = (
                        f"Hi {name or ''},\n\n{note} Our team will connect with you shortly.\n\n"
                        f"Here is a copy of your submission:\n\nName:\n{name}\n\nEmail:\n{email}\n\n"
                        f"Phone:\n{phone_display}\n\nMessage:\n{message}\n\n- Vartistic Studio"
                    )

                    confirm_html = f"""
                    <html>
                        <body style="margin:0;padding:20px;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
                            <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(16,24,40,0.06);overflow:hidden;">
                                  <div style="background:linear-gradient(90deg,#b8860b,#ffd700);padding:18px 22px;color:#fff;">
                                    <h2 style="margin:0;font-size:16px">Vartistic Studio</h2>
                                </div>
                                <div style="padding:20px;color:#0f172a;font-size:14px;line-height:1.5">
                                    <p style="margin:0 0 12px">Hi {safe_name or ""},</p>
                                    <p style="margin:0 0 16px">{note} Our team will connect with you shortly.</p>
                                    <div style="background:#f8fafc;padding:14px;border-radius:6px;margin-bottom:12px;">
                                        <p style="margin:0 0 8px;font-weight:600">Your submission</p>
                                        <p style="margin:0"><strong>Name:</strong> {safe_name}</p>
                                        <p style="margin:6px 0 0"><strong>Email:</strong> {safe_email}</p>
                                        <p style="margin:6px 0 0"><strong>Phone:</strong> {safe_phone}</p>
                                    </div>
                                    <div style="white-space:pre-wrap;color:#111827">{safe_message}</div>
                                </div>
                                <div style="padding:14px 20px;background:#fcfcfd;border-top:1px solid #eef2f7;font-size:12px;color:#6b7280">
                                    <div>- Vartistic Studio</div>
                                    <div style="margin-top:6px;color:#9ca3af">We typically reply within 1 business day.</div>
                                </div>
                            </div>
                        </body>
                    </html>
                    """

                    confirm.set_content(confirm_body)
                    confirm.add_alternative(confirm_html, subtype="html")
                    smtp.send_message(confirm)
                    user_email_sent = True
            except Exception:
                app.logger.exception("Failed to send confirmation email to user")

        return jsonify(success=True, user_email_sent=user_email_sent), 200
    except Exception as e:
        app.logger.exception("Failed to send email (SMTP)")
        return jsonify(success=False, error=str(e)), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
