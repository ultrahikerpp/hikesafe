export const bilingual = (chinese: string, english: string) =>
  chinese + '\n' + english;

const listValues = (items: string[]) => ({
  chinese: items.join('、'),
  english: items.join(', '),
});

const quantity = (value: number, singular: string, plural: string) =>
  `${value} ${value === 1 ? singular : plural}`;

export const copy = {
  homeTitle: bilingual('HikeSafe 登山留守', 'HikeSafe Hiking Check-in'),
  metadataDescription: bilingual('把路線與最後回報留給重要的人', 'Share your route and latest check-in with the people who matter'),
  homeLoginInstructions: bilingual(
    '請先以 LINE 登入；本機未設定 LINE 憑證時，只能使用明確的開發測試流程，不能偽裝為 LINE 登入。',
    'Sign in with LINE first. If LINE credentials are not configured locally, use only the explicit development test flow; it must not impersonate a LINE login.',
  ),
  primaryActions: bilingual('主要操作', 'Primary actions'),
  createTrip: bilingual('建立行程', 'Create trip'),
  startHike: bilingual('開始登山', 'Start hike'),
  progressReport: bilingual('進度回報', 'Progress check-in'),
  safeDown: bilingual('安全下山', 'Safely down'),
  homeTripInstructions: bilingual(
    '請先建立行程；建立後可在該行程頁開始登山、回報進度與安全下山。',
    'Create a trip first. Then use its page to start the hike, report progress, and confirm everyone is safely down.',
  ),
  alertLegendLabel: bilingual('警示標示', 'Alert legend'),
  alertLegend: bilingual('警示標示：正常、留意、紅色警示', 'Alert legend: Normal, Caution, Red alert'),
  liffUnconfigured: bilingual(
    'LINE LIFF 憑證尚未設定；目前無法登入或建立正式行程。',
    'LINE LIFF credentials are not configured. Login and real trip creation are currently unavailable.',
  ),
  liffLoginError: bilingual(
    'LINE 登入未完成。請在 LINE 內重新開啟 HikeSafe 後再試。',
    'LINE login was not completed. Reopen HikeSafe in LINE and try again.',
  ),
  liffLoading: bilingual('正在確認 LINE 登入…', 'Checking LINE login…'),
  currentTrip: bilingual('目前行程', 'Current trip'),
  noActiveTrip: bilingual('目前沒有進行中的行程', 'There is no active trip'),
  noActiveTripInstructions: bilingual(
    '尚未選擇進行中的行程。請先建立行程；建立完成後會自動前往該行程頁面，再開始、回報或安全下山。',
    'No active trip is selected. Create a trip first; after creation, you will go to its page to start, check in, or confirm everyone is safely down.',
  ),
  activeTrip: bilingual('進行中行程', 'Active trip'),
  boundGuardian: bilingual('已綁定留守人', 'Bound guardian'),
  tripDraft: bilingual('行程草稿', 'Trip draft'),
  route: bilingual('路線', 'Route'),
  plannedFinish: bilingual('預計下山', 'Planned finish'),
  guardians: bilingual('留守人', 'Guardians'),
  members: bilingual('隊員', 'Members'),
  gpsRequiredToStart: bilingual('需取得目前 GPS 才能開始登山。', 'A current GPS location is required to start the hike.'),
  startTripError: bilingual(
    '無法開始行程，請確認登入、GPS 與留守綁定。',
    'The trip could not be started. Check the login, GPS, and guardian binding.',
  ),
  inviteLinkError: bilingual('無法建立邀請連結。', 'The invitation link could not be created.'),
  deputyAssigned: bilingual('已指定副領隊。', 'Deputy leader assigned.'),
  deputyAssignmentError: bilingual('無法指定副領隊。', 'The deputy leader could not be assigned.'),
  noBoundGuardian: bilingual('尚未綁定留守人', 'No guardian is bound'),
  createSquadInvite: bilingual('建立小隊邀請連結', 'Create squad invitation link'),
  startAndNotify: bilingual('開始登山並通知', 'Start hike and notify guardians'),
  roleDeputy: bilingual('副領隊', 'Deputy leader'),
  roleLeader: bilingual('隊長', 'Leader'),
  roleMember: bilingual('隊員', 'Member'),
  reportPrompt: bilingual('回報內容（可在無定位時只送文字）', 'Check-in message (text can be sent without a location)'),
  checkInPending: bilingual('目前待傳送；尚未視為成功送出', 'Pending transmission; this is not yet considered successfully sent'),
  extensionPrompt: bilingual('延長分鐘數', 'Extension in minutes'),
  finishTimeExtended: bilingual('下山時間已延長', 'Planned finish time extended'),
  finishTimeExtensionError: bilingual('無法延長下山時間', 'The planned finish time could not be extended'),
  finishConfirmation: bilingual('確認全隊已安全下山？', 'Confirm everyone is safely down?'),
  tripFinished: bilingual('行程已結束', 'Trip ended'),
  tripFinishError: bilingual('無法結束行程', 'The trip could not be ended'),
  helpPrompt: bilingual('求助內容（可在無定位時只送文字）', 'Help message (text can be sent without a location)'),
  helpError: bilingual('無法建立求助通知。', 'The help notification could not be created.'),
  activeTripLabel: bilingual('進行中行程', 'Active trip'),
  safetyNotice: bilingual('安全狀態：留意，請持續回報行程進度', 'Safety status: Caution. Keep reporting trip progress.'),
  caution: bilingual('留意', 'Caution'),
  notAvailableYet: bilingual('尚未取得', 'Not available yet'),
  elapsedTimeLabel: bilingual('經過時間', 'Elapsed time'),
  lastSuccessfulCheckIn: bilingual('最後成功送出', 'Last successful check-in'),
  currentGps: bilingual('目前 GPS', 'Current GPS'),
  pendingReports: bilingual('待傳送回報', 'Pending check-ins'),
  retryPendingReports: bilingual('重試待傳送回報', 'Retry pending check-ins'),
  reportProgress: bilingual('回報目前進度', 'Report progress'),
  extendFinishTime: bilingual('延長下山時間', 'Extend finish time'),
  needHelp: bilingual('需要協助', 'Need help'),
  safeFinishDescription: bilingual('安全下山，確認全隊已安全下山', 'Safely down; confirm everyone is safely down'),
  safeFinish: bilingual('確認全隊安全下山', 'Confirm everyone is safely down'),
  joinTripInvalid: bilingual('邀請無效或已過期。', 'The invitation is invalid or expired.'),
  joinSquad: bilingual('加入 HikeSafe 小隊', 'Join the HikeSafe squad'),
  joinInstructions: bilingual(
    '請以 LINE 登入後確認加入；加入後由隊長指定副領隊。',
    'Sign in with LINE and confirm joining. The leader assigns a deputy after you join.',
  ),
  joinTrip: bilingual('加入行程', 'Join trip'),
  guardianViewerError: bilingual(
    '無法取得留守行程，請確認 LINE 登入與授權連結。',
    'The guardian trip could not be loaded. Check the LINE login and authorization link.',
  ),
  guardianTripInfo: bilingual('留守行程資訊', 'Guardian trip information'),
  loginToCreateTrip: bilingual('完成 LINE 登入後才能建立行程。', 'Complete LINE login before creating a trip.'),
  bindingCodeError: bilingual('無法建立綁定碼', 'The binding code could not be created'),
  createTripError: bilingual('無法建立行程', 'The trip could not be created'),
  quickCreateTrip: bilingual('快速建立行程', 'Quick trip setup'),
  verifiedRoutesOnly: bilingual(
    '僅能使用已驗證、已啟用的路線。建立後仍需在登山口取得 GPS 才能開始行程。',
    'Only verified, enabled routes can be used. A GPS location at the trailhead is still required to start the trip.',
  ),
  searchVerifiedRoutes: bilingual('搜尋已驗證路線', 'Search verified routes'),
  selectOption: bilingual('請選擇', 'Select an option'),
  startsAt: bilingual('出發時間', 'Start time'),
  plannedFinishAt: bilingual('預計下山時間', 'Planned finish time'),
  tripGuardians: bilingual('本次留守人', 'Guardians for this trip'),
  boundGroup: bilingual('已綁定群組', 'Bound group'),
  noActiveBindings: bilingual('尚無有效留守綁定，請先建立綁定碼。', 'There is no active guardian binding. Create a binding code first.'),
  createBindingCode: bilingual('建立留守綁定碼', 'Create guardian binding code'),
  tripEmergencyDetails: bilingual('行程與緊急資料', 'Trip and emergency details'),
  vehicle: bilingual('交通工具', 'Vehicle'),
  equipment: bilingual('裝備（每行一項）', 'Equipment (one item per line)'),
  leaderPhone: bilingual('領隊聯絡電話（供留守聯絡）', 'Leader phone number (for guardian contact)'),
  confirmTripDetails: bilingual('我已確認路線、預計下山時間與留守人', 'I confirmed the route, planned finish time, and guardians'),
  creatingTrip: bilingual('建立中…', 'Creating…'),
  createTripDraft: bilingual('建立行程草稿', 'Create trip draft'),
  reportTitle: bilingual('HikeSafe 通報摘要', 'HikeSafe report summary'),
  reportUnavailableLocation: bilingual('最後位置未取得', 'Latest location unavailable'),
  noAutomatic119Report: bilingual('HikeSafe 尚未代為通報 119', 'HikeSafe has not contacted 119 on your behalf'),
  routeLoadError: () => bilingual(
    '目前沒有可用的已啟用路線版本。正式路線目錄尚未通過安全驗證時，無法建立行程。',
    'No enabled route version is available. A trip cannot be created until the official route catalog passes safety verification.',
  ),
  authenticationError: (actionChinese: string, actionEnglish: string) => bilingual(
    `請先完成 LINE 登入，才能${actionChinese}。`,
    `Complete LINE login before ${actionEnglish}.`,
  ),
  checkInSuccess: (at?: string) => bilingual(
    `回報已成功送出${at ? `：${at}` : ''}`,
    `Check-in sent successfully${at ? `: ${at}` : ''}`,
  ),
  helpConfirmation: (recipientChinese = '留守人', recipientEnglish = 'guardians') => bilingual(
    `求助通知已建立並送往${recipientChinese}。`,
    `A help notification was created and sent to ${recipientEnglish}.`,
  ),
  unavailableLocation: (sourceChinese = '定位', sourceEnglish = 'Location') => bilingual(
    sourceChinese === '定位' ? '未取得定位' : `未取得 ${sourceChinese}`,
    `${sourceEnglish} unavailable`,
  ),
  gpsFreshness: (minutes: number) => bilingual(
    `新鮮（${minutes} 分鐘前）`,
    `Fresh (${quantity(minutes, 'minute', 'minutes')} ago)`,
  ),
  gpsExpired: (minutes: number) => bilingual(
    `過期（${minutes} 分鐘前）`,
    `Stale (${quantity(minutes, 'minute', 'minutes')} ago)`,
  ),
  freshLocationAt: (time: string) => bilingual(`新鮮（${time}）`, `Fresh (${time})`),
  elapsedTime: (hours: number, minutes: number) => bilingual(
    hours > 0 ? `${hours} 小時 ${minutes} 分鐘` : `${minutes} 分鐘`,
    hours > 0
      ? `${quantity(hours, 'hour', 'hours')} ${quantity(minutes, 'minute', 'minutes')}`
      : quantity(minutes, 'minute', 'minutes'),
  ),
  reportCount: (count: number) => bilingual(`${count} 筆`, quantity(count, 'check-in', 'check-ins')),
  inviteLink: (url: string) => bilingual(`邀請連結：${url}`, `Invitation link: ${url}`),
  assignDeputy: (name: string) => bilingual(`指定 ${name} 為副領隊`, `Assign ${name} as deputy leader`),
  guardianNames: (guardians: Array<string | undefined>) => {
    const chinese = guardians.map((guardian) => guardian ?? '已綁定留守人');
    const english = guardians.map((guardian) => guardian ?? 'Bound guardian');
    return bilingual(chinese.join('、'), english.join(', '));
  },
  memberNames: (members: Array<{ name: string; role: string }>) => bilingual(
    members.map(({ name, role }) => `${name}（${role === 'deputy' ? '副領隊' : role === 'leader' ? '隊長' : '隊員'}）`).join('、'),
    members.map(({ name, role }) => `${name} (${role === 'deputy' ? 'Deputy leader' : role === 'leader' ? 'Leader' : 'Member'})`).join(', '),
  ),
  viewerTeam: (members: string[]) => {
    const value = listValues(members);
    return bilingual(`隊伍：${value.chinese}`, `Team: ${value.english}`);
  },
  useLastRoute: (routeName: string) => bilingual(`使用上次路線：${routeName}`, `Use previous route: ${routeName}`),
  routeSourceSummary: (durationMinutes: number, organization: string, version: string, reviewedAt: string) => bilingual(
    `官方預估 ${durationMinutes} 分鐘；來源：${organization}；版本 ${version}；覆核 ${reviewedAt}`,
    `Official estimate: ${durationMinutes} minutes; source: ${organization}; version ${version}; reviewed ${reviewedAt}`,
  ),
  bindingCodeInstructions: (code: string) => bilingual(
    `本次綁定碼：${code}（10 分鐘有效）。請在 HikeSafe 官方帳號私訊、群組或聊天室輸入「綁定 ${code}」。`,
    `Binding code: ${code} (valid for 10 minutes). Send “綁定 ${code}” to the official HikeSafe account in a direct message, group, or chat room.`,
  ),
  reportTeam: (members: string[]) => {
    const value = listValues(members);
    return bilingual(`隊伍：${value.chinese}`, `Team: ${value.english}`);
  },
  reportRoute: (routeName: string) => bilingual(`路線：${routeName}`, `Route: ${routeName}`),
  reportStartedAt: (time: string) => bilingual(`開始時間：${time}`, `Start time: ${time}`),
  reportPlannedFinish: (time: string) => bilingual(`預計下山：${time}`, `Planned finish: ${time}`),
  reportLastCheckIn: (time?: string) => bilingual(
    `最後成功回報：${time ?? '尚無回報'}`,
    `Last successful check-in: ${time ?? 'No check-in yet'}`,
  ),
  reportLocation: (latitude: number, longitude: number) => bilingual(
    `最後位置：${latitude}, ${longitude}`,
    `Latest location: ${latitude}, ${longitude}`,
  ),
  reportLocationTime: (source: 'gps' | 'network' | 'line', time: string) => ({
    gps: bilingual(`GPS 時間：${time}`, `GPS time: ${time}`),
    network: bilingual(`網路定位時間：${time}`, `Network location time: ${time}`),
    line: bilingual(`LINE 回報時間：${time}`, `LINE check-in time: ${time}`),
  })[source],
  reportLocationAccuracy: (source: 'gps' | 'network' | 'line', accuracyMeters: number | null) => {
    if (source === 'line') return bilingual('位置精度：LINE 未提供', 'Location accuracy: Not provided by LINE');
    if (accuracyMeters === null) return undefined;
    return source === 'gps'
      ? bilingual(`GPS 精度：${accuracyMeters} 公尺`, `GPS accuracy: ${accuracyMeters} meters`)
      : bilingual(`網路定位精度：${accuracyMeters} 公尺`, `Network location accuracy: ${accuracyMeters} meters`);
  },
  reportVehicle: (vehicle: string) => bilingual(`車輛：${vehicle || '未提供'}`, `Vehicle: ${vehicle || 'Not provided'}`),
  reportEquipment: (items: string[]) => {
    const value = listValues(items);
    return bilingual(`裝備：${value.chinese || '未提供'}`, `Equipment: ${value.english || 'Not provided'}`);
  },
  reportCheckpoints: (items: string[]) => {
    const value = listValues(items);
    return bilingual(`檢查點：${value.chinese || '未提供'}`, `Checkpoints: ${value.english || 'Not provided'}`);
  },
  reportEvacuationPoints: (items: string[]) => {
    const value = listValues(items);
    return bilingual(
      `撤離點：${value.chinese || '官方資料未載明'}`,
      `Evacuation points: ${value.english || 'Not specified in official data'}`,
    );
  },
} as const;
