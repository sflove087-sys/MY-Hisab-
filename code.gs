
// --- CONFIGURATION ---
const SPREADSHEET_ID = '1t25TTWAtE7kDrLgQ8kF9HX8iS6j4aGZECiM8nKf2i4E';
const USERS_SHEET_NAME = 'Users';
const TRANSACTIONS_SHEET_NAME = 'Transactions';

// --- MAIN HANDLER ---
function doGet(e) {
  const action = e.parameter.action;
  let result;
  
  try {
    switch (action) {
      case 'login':
        result = loginUser(e.parameter.email, e.parameter.password);
        break;
      case 'addUser':
        result = addUser(e.parameter.name, e.parameter.mobile, e.parameter.email, e.parameter.password);
        break;
      case 'getUserById':
        result = getUserById(e.parameter.id);
        break;
      case 'getUserByMobile':
        result = getUserByMobile(e.parameter.mobile, e.parameter.type);
        break;
      case 'getTransactionsForUser':
        result = getTransactionsForUser(e.parameter.userId);
        break;
      case 'getTransactionById':
        result = getTransactionById(e.parameter.transactionId);
        break;
      case 'performSendMoney':
        result = performSendMoney(e.parameter.fromUserId, e.parameter.toMobile, parseFloat(e.parameter.amount));
        break;
      case 'performCashOut':
        result = performCashOut(e.parameter.fromUserId, e.parameter.agentMobile, parseFloat(e.parameter.amount));
        break;
      case 'performCashIn':
        result = performCashIn(e.parameter.agentId, e.parameter.customerMobile, parseFloat(e.parameter.amount));
        break;
      case 'requestAgentCashOut':
        result = requestAgentCashOut(e.parameter.agentId, e.parameter.customerMobile, parseFloat(e.parameter.amount));
        break;
      case 'approveCashOutRequest':
        result = approveCashOutRequest(e.parameter.userId, e.parameter.transactionId, e.parameter.pin);
        break;
      case 'rejectCashOutRequest':
        result = rejectCashOutRequest(e.parameter.userId, e.parameter.transactionId);
        break;
      case 'changePassword':
        result = changePassword(e.parameter.userId, e.parameter.oldPassword, e.parameter.newPassword);
        break;
      default:
        result = { error: 'Invalid action' };
    }
  } catch (error) {
    result = { error: 'An error occurred: ' + error.message };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- HELPER FUNCTIONS ---

function getOrCreateSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    let headers;
    if (sheetName === USERS_SHEET_NAME) {
      headers = ['id', 'name', 'mobile', 'email', 'password', 'balance', 'type', 'commission'];
    } else if (sheetName === TRANSACTIONS_SHEET_NAME) {
      headers = ['id', 'type', 'amount', 'from', 'to', 'fromName', 'toName', 'date', 'status'];
    }
    if (headers && headers.length > 0) sheet.appendRow(headers);
  }
  return sheet;
}

function normalizeMobile(mobile) {
  const mobileStr = String(mobile || ''); 
  if (!mobileStr) return '';
  let normalized = mobileStr.trim();
  if (normalized.startsWith('+880')) normalized = normalized.substring(4);
  else if (normalized.startsWith('880')) normalized = normalized.substring(3);
  if (normalized.startsWith('0')) normalized = normalized.substring(1);
  return normalized;
}

function sheetToJSON(sheet) {
  if (!sheet) return [];
  const displayData = sheet.getDataRange().getDisplayValues();
  if (displayData.length < 2) return [];
  const headers = displayData.shift();
  return displayData.map(function(row) {
    const obj = {};
    headers.forEach(function(header, colIndex) { obj[header] = row[colIndex]; });
    return obj;
  });
}

function getUserByMobile(mobile, type) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, USERS_SHEET_NAME);
  const users = sheetToJSON(sheet);
  const normTarget = normalizeMobile(mobile);
  const user = users.find(u => normalizeMobile(u.mobile) === normTarget && (type ? u.type === type : true));
  if (user) {
    delete user.password; // Security
    return user;
  }
  return { error: 'User not found' };
}

function findUserRowIndexByMobile(usersData, usersDisplayData, mobile, userType = null) {
  const headers = usersData[0];
  const mobileColumnIndex = headers.indexOf('mobile');
  const typeColumnIndex = headers.indexOf('type');
  const normalizedAppMobile = normalizeMobile(mobile);
  
  for (let i = 1; i < usersDisplayData.length; i++) {
    const sheetMobile = usersDisplayData[i][mobileColumnIndex];
    const normalizedSheetMobile = normalizeMobile(sheetMobile);
    if (normalizedAppMobile && normalizedSheetMobile && normalizedAppMobile === normalizedSheetMobile) {
      if (userType) {
        if (String(usersData[i][typeColumnIndex]) === userType) return i;
      } else {
        return i;
      }
    }
  }
  return -1;
}

function findUserRowIndexByEmail(usersData, email) {
    const headers = usersData[0];
    const emailColumnIndex = headers.indexOf('email');
    const searchEmail = String(email).trim().toLowerCase();
    for (let i = 1; i < usersData.length; i++) {
        const sheetEmail = String(usersData[i][emailColumnIndex]).trim().toLowerCase();
        if (sheetEmail === searchEmail) return i;
    }
    return -1;
}

function loginUser(loginIdentifier, password) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, USERS_SHEET_NAME);
  const users = sheetToJSON(sheet); 
  let user;

  if (String(loginIdentifier).includes('@')) {
    // Email login
    user = users.find(u => u.email.trim().toLowerCase() === String(loginIdentifier).trim().toLowerCase() && u.password === password);
  } else {
    // Mobile login
    const normIdentifier = normalizeMobile(loginIdentifier);
    user = users.find(u => normalizeMobile(u.mobile) === normIdentifier && u.password === password);
  }

  if (user) {
    user.balance = parseFloat(user.balance) || 0;
    user.commission = parseFloat(user.commission) || 0;
    delete user.password; // Security: Never send password to client
  }
  return user || null;
}

function addUser(name, mobile, email, password) {
  return performLockedWrite(() => {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usersSheet = getOrCreateSheet(ss, USERS_SHEET_NAME);
    const usersData = usersSheet.getDataRange().getValues();
    const usersDisplayData = usersSheet.getDataRange().getDisplayValues();
    if (findUserRowIndexByEmail(usersData, email) !== -1) return { status: 'Failed', error: 'Email exists.' };
    if (findUserRowIndexByMobile(usersData, usersDisplayData, mobile) !== -1) return { status: 'Failed', error: 'Mobile exists.' };
    const newId = `user_${new Date().getTime()}`;
    usersSheet.appendRow([newId, name, `'${mobile}`, email, `'${password}`, 0, 'Personal', 0]);
    return { status: 'Success', user: { id: newId, name: name, mobile: mobile, email: email, balance: 0, type: 'Personal' } };
  });
}

function getUserById(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, USERS_SHEET_NAME);
  const users = sheetToJSON(sheet);
  const user = users.find(u => u.id == id);
  if (user) {
    user.balance = parseFloat(user.balance) || 0;
    user.commission = parseFloat(user.commission) || 0;
    delete user.password; // Security: Never send password to client
  }
  return user || null;
}

function getTransactionById(transactionId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, TRANSACTIONS_SHEET_NAME);
  const transactions = sheetToJSON(sheet);
  const transaction = transactions.find(t => t.id == transactionId);
  if (transaction) {
    transaction.amount = parseFloat(transaction.amount) || 0;
  }
  return transaction || null;
}


function getTransactionsForUser(userId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, TRANSACTIONS_SHEET_NAME);
  const transactions = sheetToJSON(sheet); 
  return transactions
    .filter(t => t.from == userId || t.to == userId)
    .map(t => { t.amount = parseFloat(t.amount) || 0; return t; })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function performLockedWrite(action) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try { return action(); } finally { lock.releaseLock(); }
}

function changePassword(userId, oldPassword, newPassword) {
  return performLockedWrite(() => {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usersSheet = getOrCreateSheet(ss, USERS_SHEET_NAME);
    const usersData = usersSheet.getDataRange().getValues();
    const usersDisplayData = usersSheet.getDataRange().getDisplayValues();
    const headers = usersData[0];
    const passIdx = headers.indexOf('password');
    const userRowIndex = usersData.findIndex(row => row[headers.indexOf('id')] == userId);
    if (userRowIndex === -1) return { status: 'Failed', error: "User not found" };
    if (usersDisplayData[userRowIndex][passIdx] !== oldPassword) return { status: 'Failed', error: "Incorrect password" };
    usersSheet.getRange(userRowIndex + 1, passIdx + 1).setValue(`'${newPassword}`);
    return { status: 'Success' };
  });
}

function performSendMoney(fromUserId, toMobile, amount) {
  return performLockedWrite(() => {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usersSheet = getOrCreateSheet(ss, USERS_SHEET_NAME);
    const usersData = usersSheet.getDataRange().getValues();
    const usersDisplayData = usersSheet.getDataRange().getDisplayValues();
    const headers = usersData[0];
    const balIdx = headers.indexOf('balance');
    const fromUserRowIndex = usersData.findIndex(row => row[headers.indexOf('id')] == fromUserId);
    const toUserRowIndex = findUserRowIndexByMobile(usersData, usersDisplayData, toMobile);
    if (fromUserRowIndex === -1 || toUserRowIndex === -1) return { error: "User not found" };
    const fromUserBalance = parseFloat(usersData[fromUserRowIndex][balIdx]);
    if (fromUserBalance < amount) return { error: "Insufficient balance" };
    const toUserBalance = parseFloat(usersData[toUserRowIndex][balIdx]);
    usersSheet.getRange(fromUserRowIndex + 1, balIdx + 1).setValue(fromUserBalance - amount);
    usersSheet.getRange(toUserRowIndex + 1, balIdx + 1).setValue(toUserBalance + amount);
    getOrCreateSheet(ss, TRANSACTIONS_SHEET_NAME).appendRow([
      `txn_${new Date().getTime()}`, 'Send Money', amount, usersData[fromUserRowIndex][headers.indexOf('id')], usersData[toUserRowIndex][headers.indexOf('id')],
      usersData[fromUserRowIndex][headers.indexOf('name')], usersData[toUserRowIndex][headers.indexOf('name')], new Date().toISOString(), 'Success'
    ]);
    return { status: 'Success' };
  });
}

function performCashOut(fromUserId, agentMobile, amount) {
    return performLockedWrite(() => {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const usersSheet = getOrCreateSheet(ss, USERS_SHEET_NAME);
        const usersData = usersSheet.getDataRange().getValues();
        const usersDisplayData = usersSheet.getDataRange().getDisplayValues();
        const headers = usersData[0];
        const balIdx = headers.indexOf('balance');
        const commIdx = headers.indexOf('commission');
        const fromUserRowIndex = usersData.findIndex(row => row[headers.indexOf('id')] == fromUserId);
        const agentRowIndex = findUserRowIndexByMobile(usersData, usersDisplayData, agentMobile, 'Agent');
        if (fromUserRowIndex === -1 || agentRowIndex === -1) return { error: "User or Agent not found" };
        const fromUserBalance = parseFloat(usersData[fromUserRowIndex][balIdx]);
        if (fromUserBalance < amount) return { error: "Insufficient balance" };
        const agentBalance = parseFloat(usersData[agentRowIndex][balIdx]);
        usersSheet.getRange(fromUserRowIndex + 1, balIdx + 1).setValue(fromUserBalance - amount);
        usersSheet.getRange(agentRowIndex + 1, balIdx + 1).setValue(agentBalance + amount);
        getOrCreateSheet(ss, TRANSACTIONS_SHEET_NAME).appendRow([
            `txn_${new Date().getTime()}`, 'Cash Out', amount, usersData[fromUserRowIndex][headers.indexOf('id')], usersData[agentRowIndex][headers.indexOf('id')],
            usersData[fromUserRowIndex][headers.indexOf('name')], usersData[agentRowIndex][headers.indexOf('name')], new Date().toISOString(), 'Success'
        ]);
        return { status: 'Success' };
    });
}

function requestAgentCashOut(agentId, customerMobile, amount) {
    return performLockedWrite(() => {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const usersSheet = getOrCreateSheet(ss, USERS_SHEET_NAME);
        const allUsers = sheetToJSON(usersSheet);
        const agent = allUsers.find(u => u.id == agentId);
        const customer = allUsers.find(u => normalizeMobile(u.mobile) === normalizeMobile(customerMobile) && u.type === 'Personal');
        if (!agent || !customer) return { status: 'Failed', error: "Agent or Customer not found" };
        if (parseFloat(customer.balance) < amount) return { status: 'Failed', error: "Customer has insufficient balance" };
        
        const txId = `txn_${new Date().getTime()}`;
        getOrCreateSheet(ss, TRANSACTIONS_SHEET_NAME).appendRow([
            txId, 'Cash Out', amount, customer.id, agent.id, customer.name, agent.name, new Date().toISOString(), 'Pending'
        ]);
        return { status: 'Success' };
    });
}

function approveCashOutRequest(userId, transactionId, pin) {
  return performLockedWrite(() => {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usersSheet = getOrCreateSheet(ss, USERS_SHEET_NAME);
    const usersData = usersSheet.getDataRange().getValues();
    const usersDisplayData = usersSheet.getDataRange().getDisplayValues();
    const headers = usersData[0];
    
    const userRowIndex = usersData.findIndex(row => row[headers.indexOf('id')] == userId);
    if (userRowIndex === -1) return { status: 'Failed', error: "User not found" };
    if (usersDisplayData[userRowIndex][headers.indexOf('password')] !== pin) return { status: 'Failed', error: "Incorrect PIN" };

    const txSheet = getOrCreateSheet(ss, TRANSACTIONS_SHEET_NAME);
    const txData = txSheet.getDataRange().getValues();
    const txHeaders = txData[0];
    const txRowIndex = txData.findIndex(row => row[txHeaders.indexOf('id')] == transactionId);
    if (txRowIndex === -1) return { status: 'Failed', error: "Transaction not found" };
    
    const tx = txData[txRowIndex];
    if (tx[txHeaders.indexOf('status')] !== 'Pending') return { status: 'Failed', error: "Request is not pending" };
    if (tx[txHeaders.indexOf('from')] !== userId) return { status: 'Failed', error: "User is not authorized to approve this" };

    const amount = parseFloat(tx[txHeaders.indexOf('amount')]);
    const userBalance = parseFloat(usersData[userRowIndex][headers.indexOf('balance')]);
    if (userBalance < amount) return { status: 'Failed', error: "Insufficient balance" };

    const agentId = tx[txHeaders.indexOf('to')];
    const agentRowIndex = usersData.findIndex(row => row[headers.indexOf('id')] == agentId);
    if (agentRowIndex === -1) return { status: 'Failed', error: "Agent not found" };
    const agentBalance = parseFloat(usersData[agentRowIndex][headers.indexOf('balance')]);
    
    // Perform transaction
    usersSheet.getRange(userRowIndex + 1, headers.indexOf('balance') + 1).setValue(userBalance - amount);
    usersSheet.getRange(agentRowIndex + 1, headers.indexOf('balance') + 1).setValue(agentBalance + amount);
    txSheet.getRange(txRowIndex + 1, txHeaders.indexOf('status') + 1).setValue('Success');

    return { status: 'Success' };
  });
}

function rejectCashOutRequest(userId, transactionId) {
    return performLockedWrite(() => {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const txSheet = getOrCreateSheet(ss, TRANSACTIONS_SHEET_NAME);
        const txData = txSheet.getDataRange().getValues();
        const txHeaders = txData[0];
        const txRowIndex = txData.findIndex(row => row[txHeaders.indexOf('id')] == transactionId);
        if (txRowIndex === -1) return { status: 'Failed', error: "Transaction not found" };

        const tx = txData[txRowIndex];
        if (tx[txHeaders.indexOf('from')] !== userId) return { status: 'Failed', error: "User not authorized" };
        if (tx[txHeaders.indexOf('status')] !== 'Pending') return { status: 'Failed', error: "Request is not pending" };
        
        txSheet.getRange(txRowIndex + 1, txHeaders.indexOf('status') + 1).setValue('Rejected');
        return { status: 'Success' };
    });
}

function performCashIn(agentId, customerMobile, amount) {
    return performLockedWrite(() => {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const usersSheet = getOrCreateSheet(ss, USERS_SHEET_NAME);
        const usersData = usersSheet.getDataRange().getValues();
        const usersDisplayData = usersSheet.getDataRange().getDisplayValues();
        const headers = usersData[0];
        const balIdx = headers.indexOf('balance');
        const agentRowIndex = usersData.findIndex(row => row[headers.indexOf('id')] == agentId);
        const customerRowIndex = findUserRowIndexByMobile(usersData, usersDisplayData, customerMobile, 'Personal');
        if (agentRowIndex === -1 || customerRowIndex === -1) return { error: "Agent or Customer not found" };
        const agentBalance = parseFloat(usersData[agentRowIndex][balIdx]);
        if (agentBalance < amount) return { error: "Agent insufficient balance" };
        const customerBalance = parseFloat(usersData[customerRowIndex][balIdx]);
        usersSheet.getRange(agentRowIndex + 1, balIdx + 1).setValue(agentBalance - amount);
        usersSheet.getRange(customerRowIndex + 1, balIdx + 1).setValue(customerBalance + amount);
        getOrCreateSheet(ss, TRANSACTIONS_SHEET_NAME).appendRow([
            `txn_${new Date().getTime()}`, 'Cash In', amount, usersData[agentRowIndex][headers.indexOf('id')], usersData[customerRowIndex][headers.indexOf('id')],
            usersData[agentRowIndex][headers.indexOf('name')], usersData[customerRowIndex][headers.indexOf('name')], new Date().toISOString(), 'Success'
        ]);
        return { status: 'Success' };
    });
}