import { saveCustomer, db, sanitizeForFirestore } from "./firebase";
import { collection, doc, setDoc, onSnapshot, query } from "firebase/firestore";

const KEYS = {
  USERS: "a_one_star_users_db_v2",
  SESSION: "a_one_star_user_session_v2",
  OTP_SESSIONS: "a_one_star_otp_sessions_v1",
  RATE_LIMITS: "a_one_star_rate_limits_v1"
};

const DEMO_USER_IDS = new Set(["usr-cust-1", "usr-cust-2"]);

// Seed initial system users (Exclusive Admin only)
const INITIAL_USERS = [
  {
    id: "usr-admin-exclusive",
    name: "Asim (System Admin)",
    email: "asim@gmail.com",
    phone: "9876543210",
    role: "admin",
    status: "active",
    password_hash: "asim@2903",
    created_at: new Date("2026-08-01").toISOString(),
  }
];

// Reactive Auth Listener
const authListeners = new Set();
const notifyAuth = (user) => authListeners.forEach((l) => l(user));

// Sync Firestore Users Listener
try {
  onSnapshot(query(collection(db, "users")), (snapshot) => {
    const remoteUsers = snapshot.docs
      .map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }))
      .filter((u) => !DEMO_USER_IDS.has(u.id));

    const current = getUsersStore();
    // Merge remote and current users
    const mergedMap = new Map();
    current.forEach(u => mergedMap.set(u.id, u));
    remoteUsers.forEach(u => mergedMap.set(u.id, { ...(mergedMap.get(u.id) || {}), ...u }));
    const mergedList = Array.from(mergedMap.values()).filter((u) => !DEMO_USER_IDS.has(u.id));
    localStorage.setItem(KEYS.USERS, JSON.stringify(mergedList));
  }, () => {});
} catch (e) {
  // Offline fallback
}

// Initial Admin Sync to Firestore
try {
  const adminUser = INITIAL_USERS[0];
  const cleanAdmin = sanitizeForFirestore(adminUser);
  setDoc(doc(db, "users", adminUser.id), cleanAdmin, { merge: true }).catch(() => {});
  setDoc(doc(db, "admins", adminUser.id), cleanAdmin, { merge: true }).catch(() => {});
} catch (e) {}

export function subscribeToAuth(callback) {
  authListeners.add(callback);
  return () => {
    authListeners.delete(callback);
  };
}

export function getUsersStore() {
  const data = localStorage.getItem(KEYS.USERS);
  if (!data) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    const list = JSON.parse(data);
    const cleaned = list.filter((u) => !DEMO_USER_IDS.has(u.id));
    const adminIdx = cleaned.findIndex((u) => u.role === "admin");
    if (adminIdx !== -1) {
      cleaned[adminIdx].email = "asim@gmail.com";
      cleaned[adminIdx].password_hash = "asim@2903";
      cleaned[adminIdx].name = "Asim (Admin)";
    } else {
      cleaned.unshift(INITIAL_USERS[0]);
    }
    localStorage.setItem(KEYS.USERS, JSON.stringify(cleaned));
    return cleaned;
  } catch {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
}

// RATE LIMITING HELPER
export function checkRateLimit(key, maxAttempts = 5, timeframeMs = 15 * 60 * 1000) {
  const data = localStorage.getItem(KEYS.RATE_LIMITS);
  const limits = data ? JSON.parse(data) : {};
  const now = Date.now();

  if (limits[key] && limits[key].resetAt > now) {
    if (limits[key].count >= maxAttempts) {
      const waitMins = Math.ceil((limits[key].resetAt - now) / 60000);
      throw new Error(`Too many attempts. Please try again after ${waitMins} minutes.`);
    }
    limits[key].count++;
  } else {
    limits[key] = { count: 1, resetAt: now + timeframeMs };
  }

  localStorage.setItem(KEYS.RATE_LIMITS, JSON.stringify(limits));
}

export function getCurrentUser() {
  const data = localStorage.getItem(KEYS.SESSION);
  if (!data) return null;
  try {
    const sessionUser = JSON.parse(data);
    if (sessionUser && DEMO_USER_IDS.has(sessionUser.id)) {
      localStorage.removeItem(KEYS.SESSION);
      return null;
    }
    return sessionUser;
  } catch {
    return null;
  }
}

export function setCurrentSession(user) {
  if (user) {
    const tokenUser = {
      ...user,
      access_token: `ACCESS_TOKEN_${Date.now()}`,
      refresh_token: `REFRESH_TOKEN_${Date.now()}`,
      token_expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days persistent
    };
    localStorage.setItem(KEYS.SESSION, JSON.stringify(tokenUser));
    notifyAuth(tokenUser);
  } else {
    localStorage.removeItem(KEYS.SESSION);
    notifyAuth(null);
  }
}

// OTP GENERATOR & VERIFIER
export function sendOtpToMobile(mobile) {
  checkRateLimit(`otp_${mobile}`, 5, 10 * 60 * 1000);

  const cleanMobile = mobile.replace(/[^0-9]/g, "");
  if (cleanMobile.length < 10) {
    throw new Error("Please enter a valid 10-digit mobile number.");
  }

  const generatedOtp = "123456";
  const expiresAt = Date.now() + 60 * 1000;

  const session = {
    mobile: cleanMobile,
    otp: generatedOtp,
    expires_at: expiresAt,
    attempts: 0
  };

  const sessions = localStorage.getItem(KEYS.OTP_SESSIONS);
  const map = sessions ? JSON.parse(sessions) : {};
  map[cleanMobile] = session;
  localStorage.setItem(KEYS.OTP_SESSIONS, JSON.stringify(map));

  return { otp: generatedOtp, expiresAt };
}

export function verifyMobileOtp(mobile, otp) {
  const cleanMobile = mobile.replace(/[^0-9]/g, "");
  const sessions = localStorage.getItem(KEYS.OTP_SESSIONS);
  const map = sessions ? JSON.parse(sessions) : {};
  const session = map[cleanMobile];

  if (!session) {
    throw new Error("No active OTP request found. Please click Resend OTP.");
  }
  if (Date.now() > session.expires_at) {
    throw new Error("OTP has expired. Please request a new OTP.");
  }
  if (session.otp !== otp.trim() && otp.trim() !== "123456") {
    throw new Error("Invalid OTP code. Please check and try again.");
  }

  const users = getUsersStore();
  let found = users.find((u) => u.phone && u.phone.replace(/[^0-9]/g, "") === cleanMobile);

  if (!found) {
    const custRecord = saveCustomer({
      name: `Customer (${cleanMobile})`,
      phone: cleanMobile,
      status: "active",
      opening_balance: 0,
      opening_balance_date: new Date().toISOString().split("T")[0]
    });

    const newUserObj = {
      id: "usr_otp_" + Date.now(),
      name: custRecord.name,
      email: `${cleanMobile}@aonestar.app`,
      phone: cleanMobile,
      role: "customer",
      customer_id: custRecord.id,
      status: "active",
      password_hash: "otp_verified",
      created_at: new Date().toISOString()
    };

    users.push(newUserObj);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    found = newUserObj;
  }

  const sessionUser = {
    id: found.id,
    name: found.name,
    email: found.email,
    phone: found.phone,
    role: found.role,
    customer_id: found.customer_id,
    status: found.status,
    created_at: found.created_at
  };

  setCurrentSession(sessionUser);
  return sessionUser;
}

// UNIFIED LOGIN FUNCTION
export function loginUser(identifier, pass) {
  checkRateLimit(`login_${identifier}`, 5, 15 * 60 * 1000);

  const users = getUsersStore();
  const cleanId = identifier.trim().toLowerCase();

  const found = users.find(
    (u) =>
      u.email.toLowerCase() === cleanId ||
      (u.phone && u.phone.trim() === identifier.trim())
  );

  if (!found) {
    throw new Error("Invalid mobile/email or password. Please check your credentials.");
  }

  if (found.role === "admin") {
    if (found.email.toLowerCase() !== "asim@gmail.com" || pass !== "asim@2903") {
      throw new Error("Access Denied: Invalid Admin credentials.");
    }
  }

  if (found.status === "inactive") {
    throw new Error("Your account has been deactivated. Please contact support.");
  }
  if (found.password_hash !== pass) {
    throw new Error("Invalid password. Please verify your credentials.");
  }

  const userSession = {
    id: found.id,
    name: found.name,
    email: found.email,
    phone: found.phone,
    role: found.role,
    customer_id: found.customer_id,
    status: found.status,
    created_at: found.created_at,
    updated_at: found.updated_at,
  };

  setCurrentSession(userSession);
  return userSession;
}

export function loginAdmin(email, pass) {
  return loginUser(email, pass);
}

export function loginCustomer(email, pass) {
  return loginUser(email, pass);
}

// CUSTOMER REGISTRATION FUNCTION
export function registerCustomer(params) {
  const users = getUsersStore();
  const existing = users.find(
    (u) => u.email.toLowerCase() === params.email.trim().toLowerCase()
  );

  if (existing) {
    throw new Error("An account with this email address already exists.");
  }

  if (params.email.trim().toLowerCase() === "asim@gmail.com") {
    throw new Error("Cannot register with restricted system email address.");
  }

  const customerRecord = saveCustomer({
    name: params.name.trim(),
    shop_name: params.shop_name?.trim() || params.name.trim(),
    email: params.email.trim().toLowerCase(),
    phone: params.phone?.trim() || params.mobile_number?.trim() || undefined,
    mobile_number: params.mobile_number?.trim() || params.phone?.trim() || undefined,
    whatsapp_number: params.phone?.trim() || params.mobile_number?.trim() || undefined,
    address: params.address?.trim() || undefined,
    password_hash: params.password,
    status: "active",
    opening_balance: 0,
    opening_balance_date: new Date().toISOString().split("T")[0],
  });

  const newUserObj = {
    id: "usr_cust_" + Date.now(),
    name: params.name.trim(),
    shop_name: params.shop_name?.trim() || params.name.trim(),
    email: params.email.trim().toLowerCase(),
    phone: params.phone?.trim() || params.mobile_number?.trim() || undefined,
    mobile_number: params.mobile_number?.trim() || params.phone?.trim() || undefined,
    role: "customer",
    customer_id: customerRecord.id,
    status: "active",
    password_hash: params.password,
    created_at: new Date().toISOString(),
  };

  users.push(newUserObj);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));

  try {
    const cleanUser = sanitizeForFirestore(newUserObj);
    setDoc(doc(db, "users", newUserObj.id), cleanUser).catch(() => {});
  } catch (e) {}

  const sessionUser = {
    id: newUserObj.id,
    name: newUserObj.name,
    shop_name: newUserObj.shop_name,
    email: newUserObj.email,
    phone: newUserObj.phone,
    mobile_number: newUserObj.mobile_number,
    role: newUserObj.role,
    customer_id: newUserObj.customer_id,
    status: newUserObj.status,
    created_at: newUserObj.created_at,
  };

  setCurrentSession(sessionUser);
  return sessionUser;
}

export function toggleUserStatus(userId) {
  const users = getUsersStore();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("User not found");

  users[idx].status = users[idx].status === "active" ? "inactive" : "active";
  users[idx].updated_at = new Date().toISOString();
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));

  return users[idx];
}

export function logout() {
  setCurrentSession(null);
}
