(async function() {
  await figma.loadAllPagesAsync();

  var BATCH = 0;

  var TARGET_PAGES = [
    'Accordion','Alert','Alert Dialog','Aspect Ratio','Avatar',
    'Badge','Breadcrumb','Button','Button Group','Calendar',
    'Card','Carousel','Chart','Checkbox','Collapsible',
    'Combobox','Command','Context Menu','Data Table','Date Picker',
    'Dialog','Drawer','Dropdown Menu','Empty','Field',
    'Form','Hover Card','Input','Input Group','Input OTP',
    'Item','Kbd','Label','Menubar','Navigation Menu',
    'Pagination','Popover','Progress','Radio Group','Resizable',
    'Scroll Area','Select','Separator','Sheet','Sidebar',
    'Skeleton','Slider','Sonner','Spinner','Switch',
    'Table','Tabs','Textarea','Toggle','Toggle Group',
    'Tooltip','Uploader','Utility Components'
  ];

  // Tìm page theo partial match — bỏ qua emoji và ký tự đặc biệt
  function findPage(name) {
    var clean = function(s) { return s.replace(/[^\w\s]/g, '').trim().toLowerCase(); };
    return figma.root.children.find(function(p) {
      return clean(p.name) === clean(name) || p.name.toLowerCase().indexOf(name.toLowerCase()) !== -1;
    });
  }

  var BATCH_SIZE = 10;
  var currentBatch = 0;
  var totalBatches = Math.ceil(TARGET_PAGES.length / BATCH_SIZE);

  function processBatch(batchIndex) {
    var start = batchIndex * BATCH_SIZE;
    var end = Math.min(start + BATCH_SIZE, TARGET_PAGES.length);
    var batchPages = TARGET_PAGES.slice(start, end);

    var batchSets = [];
    var batchComponents = [];
    var pageResults = [];

    for (var i = 0; i < batchPages.length; i++) {
      var pageName = batchPages[i];
      var page = findPage(pageName);
      if (!page) {
        pageResults.push({ page: pageName, sets: 0, components: 0, status: 'not found' });
        continue;
      }
      var sets = page.findAllWithCriteria({ types: ['COMPONENT_SET'] });
      var comps = page.findAllWithCriteria({ types: ['COMPONENT'] });
      pageResults.push({ page: pageName, realName: page.name, sets: sets.length, components: comps.length, status: 'ok' });

      sets.forEach(function(cs) {
        var options = {};
        Object.entries(cs.componentPropertyDefinitions || {}).forEach(function(entry) {
          if (entry[1].variantOptions) options[entry[0]] = entry[1].variantOptions;
        });
        batchSets.push({
          name: cs.name, key: cs.key, page: pageName,
          variantProperties: Object.keys(cs.componentPropertyDefinitions || {}),
          variantOptions: options,
          componentCount: cs.children ? cs.children.length : 0
        });
      });

      comps.forEach(function(c) {
        var variantValues = {};
        if (c.parent && c.parent.type === 'COMPONENT_SET') {
          c.name.split(', ').forEach(function(part) {
            var kv = part.split('=');
            if (kv.length === 2) variantValues[kv[0].trim()] = kv[1].trim();
          });
        }
        batchComponents.push({
          name: c.name, key: c.key, page: pageName,
          componentSet: (c.parent && c.parent.type === 'COMPONENT_SET') ? c.parent.name : null,
          variantValues: variantValues,
          width: Math.round(c.width),
          height: Math.round(c.height)
        });
      });
    }

    var output = JSON.stringify({
      batch: batchIndex,
      pages: batchPages,
      componentSets: batchSets,
      components: batchComponents
    }, null, 2);

    var rows = pageResults.map(function(r) {
      var icon = r.status === 'ok' ? '✅' : '❌';
      var label = r.realName ? r.page + ' <span style="color:#9ca3af;font-size:10px">(' + r.realName + ')</span>' : r.page;
      return '<tr><td style="padding:3px 8px;border-bottom:1px solid #e5e7eb">' + icon + ' ' + label + '</td>' +
        '<td style="padding:3px 8px;border-bottom:1px solid #e5e7eb;text-align:center">' + r.sets + '</td>' +
        '<td style="padding:3px 8px;border-bottom:1px solid #e5e7eb;text-align:center">' + r.components + '</td></tr>';
    }).join('');

    var isLast = (batchIndex === totalBatches - 1);
    var nextBtn = isLast
      ? '<button disabled style="flex:1;padding:8px;background:#d1d5db;color:#6b7280;border:none;border-radius:6px;font-size:12px">Đã xong ✓</button>'
      : '<button id="nextBtn" style="flex:1;padding:8px;background:#171717;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px">Batch ' + (batchIndex+1) + ' →</button>';

    figma.showUI(
      '<div style="font-family:sans-serif;padding:12px;font-size:12px">' +
      '<div style="font-weight:600;font-size:13px;margin-bottom:6px">Batch ' + batchIndex + '/' + (totalBatches-1) + ' — ' + batchPages.length + ' trang</div>' +
      '<table style="width:100%;border-collapse:collapse;margin-bottom:8px">' +
      '<thead><tr style="background:#f3f4f6"><th style="padding:3px 8px;text-align:left">Trang</th><th style="padding:3px 8px">Sets</th><th style="padding:3px 8px">Components</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table>' +
      '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:8px;margin-bottom:8px">' +
      '📦 <b>' + batchSets.length + ' sets</b> &nbsp;|&nbsp; 🧩 <b>' + batchComponents.length + ' components</b>' +
      '</div>' +
      '<textarea id="jsonOutput" style="width:100%;height:60px;font-size:10px;border:1px solid #d1d5db;border-radius:4px;padding:4px;box-sizing:border-box;margin-bottom:8px;resize:none"></textarea>' +
      '<div style="display:flex;gap:6px;margin-bottom:6px">' +
      '<button id="copyBtn" style="flex:1;padding:8px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px">📋 Copy JSON</button>' +
      nextBtn +
      '</div>' +
      '<button onclick="parent.postMessage({pluginMessage:{type:\'close\'}},\'*\')" style="width:100%;padding:6px;background:#f3f4f6;border:none;border-radius:6px;cursor:pointer;font-size:11px;color:#6b7280">Đóng plugin</button>' +
      '</div>' +
      '<script>' +
      'var json=' + JSON.stringify(output) + ';' +
      'document.getElementById("jsonOutput").value=json;' +
      'document.getElementById("copyBtn").onclick=function(){' +
        'var ta=document.getElementById("jsonOutput");ta.select();ta.setSelectionRange(0,99999);document.execCommand("copy");' +
        'document.getElementById("copyBtn").textContent="✅ Đã copy!";' +
        'setTimeout(function(){document.getElementById("copyBtn").textContent="📋 Copy JSON";},2000);' +
      '};' +
      'var nb=document.getElementById("nextBtn");if(nb)nb.onclick=function(){parent.postMessage({pluginMessage:{type:"next"}},"*");};' +
      '<\/script>',
      { width: 400, height: 480 }
    );

    figma.ui.onmessage = function(msg) {
      if (msg.type === 'close') figma.closePlugin();
      if (msg.type === 'next') { currentBatch++; if (currentBatch < totalBatches) processBatch(currentBatch); }
    };
  }

  processBatch(currentBatch);
})();