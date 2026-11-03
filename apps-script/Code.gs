/**
 * AIW DONE-FOR-YOU lead intake (Google Apps Script)
 * Receives the website form, saves a row in the Leads sheet, emails the team.
 */

var SHEET_ID = '1yMaMQMHwSwS21bHqsYW-bAP4ko1yVmH44Rr7NiUC28U'; // AIW Leads - Get Started form
var NOTIFY_TO = 'reachmoredigital01@gmail.com'; // while testing; add the full team list when going live
// Live list: 'reachmoredigital01@gmail.com, hammad.zahid@gptsearchboost.com, zubair.trabzada@gmail.com'

var HEADERS = ['Timestamp', 'Name', 'Phone', 'Email', 'Service', 'Budget (USD)',
               'Market', 'Location', 'Project', 'Consent', 'Source', 'Status'];

function doGet() {
  return json_({ ok: true, service: 'aiw-lead-intake' });
}

function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var b = JSON.parse(raw);

    var lead = {
      Timestamp: new Date().toISOString(),
      Name: clean_(b.name),
      Phone: clean_(b.phone),
      Email: clean_(b.email).toLowerCase(),
      Service: clean_(b.service),
      'Budget (USD)': clean_(b.budget),
      Market: clean_(b.market),
      Location: clean_(b.location),
      Project: clean_(b.project),
      Consent: clean_(b.consent),
      Source: clean_(b.source) || 'direct',
      Status: 'New'
    };

    if (!lead.Name || !/^\S+@\S+\.\S+$/.test(lead.Email) || lead.Consent !== 'Yes') {
      return json_({ ok: false, error: 'invalid' });
    }

    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      saveRow_(lead);
    } finally {
      lock.releaseLock();
    }

    try {
      emailTeam_(lead);
    } catch (mailErr) {
      console.error('Email failed: ' + mailErr);
    }

    return json_({ ok: true });
  } catch (err) {
    console.error('Lead failed: ' + err);
    return json_({ ok: false, error: 'server' });
  }
}

function saveRow_(lead) {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  var row = HEADERS.map(function (h) { return safeCell_(lead[h]); });
  sheet.appendRow(row);
}

function emailTeam_(lead) {
  var body =
    'New lead from the AI Workshop DONE-FOR-YOU form\n\n' +
    'Name: ' + lead.Name + '\n' +
    'Email: ' + lead.Email + '\n' +
    'Phone: ' + (lead.Phone || '-') + '\n' +
    'Needs: ' + lead.Service + '\n' +
    'Budget (USD): ' + lead['Budget (USD)'] + '\n' +
    'Market: ' + (lead.Market || '-') + '\n' +
    'Location: ' + (lead.Location || '-') + '\n' +
    'Project: ' + (lead.Project || '-') + '\n' +
    'Source: ' + lead.Source + '\n' +
    'Received: ' + lead.Timestamp + '\n\n' +
    'Full record: AIW Leads - Get Started form (Google Sheet). ' +
    'Reply to this email thread to say who is taking it, then book the call.';
  MailApp.sendEmail({
    to: NOTIFY_TO,
    subject: 'New DONE-FOR-YOU lead: ' + lead.Name + ' (' + lead.Source + ')',
    body: body,
    name: 'AIW Leads'
  });
}

function clean_(v) {
  return String(v == null ? '' : v).trim().slice(0, 1000);
}

// Stops spreadsheet formula injection (cells starting with = + - @)
function safeCell_(v) {
  v = v == null ? '' : String(v);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Run this once from the editor to authorize access and send a test lead. */
function testLead() {
  var res = doPost({ postData: { contents: JSON.stringify({
    name: 'Test Lead', email: 'test@example.com', phone: '+000', service: 'AI agents',
    budget: 'Under 1,500', market: 'Africa', location: 'Abidjan', project: 'Script test',
    consent: 'Yes', source: 'script-test' }) } });
  console.log(res.getContent());
}
