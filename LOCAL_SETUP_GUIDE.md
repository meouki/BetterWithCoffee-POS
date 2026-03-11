# PulsePoint Local Network Setup Guide

This guide explains how to set up the POS system for permanent local use in a shop environment without a domain name.

## 1. Networking Strategy (Host PC)

### DHCP Reservation (Static IP)
To ensure the backend doesn't "disappear" when the router restarts:
1. Access your Router Admin panel (usually `192.168.1.1` or `192.168.100.1`).
2. Look for **DHCP Server** -> **Static Lease** or **Address Reservation**.
3. Map the Host PC's MAC address to a fixed IP (e.g., `192.168.100.33`).

### mDNS "Domain" (Optional but Recommended)
Instead of typing the IP, you can use:
`http://[COMPUTER-NAME].local:5173`
- **Windows:** Ensure "Link-Local Multicast Name Resolution" (LLMNR) is enabled in network settings.
- **Apple/Android:** Usually works by default.

---

## 2. Windows Firewall Configuration

By default, Windows blocks incoming connections to ports 5000 and 5173. You must create "Inbound Rules".

### Via PowerShell (Run as Administrator)
The fastest way to open the ports:

```powershell
# Open Port 5000 for the Backend API
New-NetFirewallRule -DisplayName "PulsePoint Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow

# Open Port 5173 for the React Frontend
New-NetFirewallRule -DisplayName "PulsePoint Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

### Manual Method (GUI)
1. Open **Windows Defender Firewall with Advanced Security**.
2. Click **Inbound Rules** -> **New Rule**.
3. Select **Port** -> **TCP**.
4. Specific local ports: `5000, 5173`.
5. **Allow the connection**.
6. Check **Private** (and Domain if applicable), but uncheck **Public** for safety.

---

## 3. Deployment Checklist

### Host PC Config
1. **Frontend `.env`**: Ensure `VITE_API_URL` uses the Static IP or `.local` address.
   ```env
   VITE_API_URL=http://192.168.100.33:5000
   ```
2. **Backend `server.js`**: Ensure it listens on `0.0.0.0`.
   ```javascript
   app.listen(PORT, '0.0.0.0', ...);
   ```

### Client Device (Tablet/Phone/Laptop)
1. Connect to the **same Wi-Fi** as the Host PC.
2. Open Browser -> `http://192.168.100.33:5173`.
3. If it loads but shows "Server Offline", check that the Host PC's Firewall is allowing port 5000.

---

## 4. Security Recommendations
- **Staff Wi-Fi:** Keep the tablets on a private Staff Wi-Fi. Do not use the same Wi-Fi you give to customers.
- **Login Credentials:** Remove the "Mock Credentials" from the `LoginPage.jsx` return statement before going live.
- **Auto-Start:** Consider using **PM2** (Process Manager) or a Windows Task Scheduler to start the backend automatically when the PC boots.
