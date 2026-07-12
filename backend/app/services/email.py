import httpx

from app.core.config import get_settings


async def _send(to: str, subject: str, html: str) -> None:
    settings = get_settings()
    if not settings.resend_api_key:
        return
    async with httpx.AsyncClient() as client:
        await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            json={"from": settings.resend_from_email, "to": [to], "subject": subject, "html": html},
            timeout=10,
        )


async def send_password_reset(to: str, token: str) -> None:
    settings = get_settings()
    link = f"{settings.app_url}/reset-password?token={token}"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
      <div style="margin-bottom:24px">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:#6d28d9;border-radius:8px;color:#fff;font-weight:700;font-size:14px">K</span>
        <span style="margin-left:8px;font-size:16px;font-weight:600;color:#111">KnowledgeOS</span>
      </div>
      <h2 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">Reset your password</h2>
      <p style="color:#555;font-size:14px;margin:0 0 24px">Click the button below to set a new password. This link expires in 1 hour.</p>
      <a href="{link}" style="display:inline-block;background:#6d28d9;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">Reset password</a>
      <p style="color:#aaa;font-size:12px;margin:24px 0 0">If you didn't request this, you can safely ignore this email.</p>
    </div>
    """
    await _send(to, "Reset your KnowledgeOS password", html)


async def send_invite(to: str, org_name: str, inviter_name: str, token: str) -> None:
    settings = get_settings()
    link = f"{settings.app_url}/invite/accept?token={token}"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
      <div style="margin-bottom:24px">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:#6d28d9;border-radius:8px;color:#fff;font-weight:700;font-size:14px">K</span>
        <span style="margin-left:8px;font-size:16px;font-weight:600;color:#111">KnowledgeOS</span>
      </div>
      <h2 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">You're invited to {org_name}</h2>
      <p style="color:#555;font-size:14px;margin:0 0 24px">{inviter_name} has invited you to join <strong>{org_name}</strong> on KnowledgeOS. Click below to accept your invitation — it expires in 7 days.</p>
      <a href="{link}" style="display:inline-block;background:#6d28d9;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">Accept invitation</a>
      <p style="color:#aaa;font-size:12px;margin:24px 0 0">If you weren't expecting this invite, you can safely ignore this email.</p>
    </div>
    """
    await _send(to, f"You're invited to join {org_name} on KnowledgeOS", html)
