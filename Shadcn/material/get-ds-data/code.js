(async function() {
  await figma.loadAllPagesAsync();

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

  function findPage(name) {
    var clean = function(s) { return s.replace(/[^\w\s]/g, '').trim().toLowerCase(); };
    return figma.root.children.find(function(p) {
      return clean(p.name) === clean(name) || p.name.toLowerCase().indexOf(name.toLowerCase()) !== -1;
    });
  }

  var BATCH_SIZE = 10;
  var currentBatch = 0;
  var totalBatches = Math.ceil(TARGET_PAGES.length / BATCH_SIZE);
  var cachedOutputs = {};

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
        pageResults.push({ page: pageName, sets: 0, components: 0, errors: 0, status: 'not found', errorNames: [] });
        continue;
      }
      var sets = page.findAllWithCriteria({ types: ['COMPONENT_SET'] });
      var comps = page.findAllWithCriteria({ types: ['COMPONENT'] });

      var errorCount = 0;
      var errorNames = [];

      sets.forEach(function(cs) {
        try {
          var props = cs.componentPropertyDefinitions || {};
          var options = {};
          Object.entries(props).forEach(function(entry) {
            try { if (entry[1].variantOptions) options[entry[0]] = entry[1].variantOptions; } catch(e) {}
          });
          batchSets.push({
            name: cs.name, key: cs.key, page: pageName,
            variantProperties: Object.keys(props),
            variantOptions: options,
            componentCount: cs.children ? cs.children.length : 0
          });
        } catch(e) {
          errorCount++;
          errorNames.push(cs.name);
          batchSets.push({ name: cs.name, key: cs.key, page: pageName, error: e.message });
        }
      });

      comps.forEach(function(c) {
        try {
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
        } catch(e) {}
      });

      pageResults.push({ page: pageName, realName: page.name, sets: sets.length, components: comps.length, errors: errorCount, errorNames: errorNames, status: 'ok' });
    }

    var output = JSON.stringify({ batch: batchIndex, pages: batchPages, componentSets: batchSets, components: batchComponents }, null, 2);
    cachedOutputs[batchIndex] = { output: output, pageResults: pageResults, setsCount: batchSets.length, compsCount: batchComponents.length };

    showUI(batchIndex, pageResults, batchSets.length, batchComponents.length, output);
  }

  function showUI(batchIndex, pageResults, setsCount, compsCount, output) {
    var parsed = JSON.parse(output);
    if (!setsCount) setsCount = parsed.componentSets.length;
    if (!compsCount) compsCount = parsed.components.length;

    var rows = (pageResults || []).map(function(r) {
      var icon = r.status === 'not found' ? '❌' : (r.errors > 0 ? '⚠️' : '✅');
      var bg = r.errors > 0 ? 'background:#fff7ed;' : '';
      var label = r.realName && r.realName !== r.page ? r.page + ' <span style="color:#9ca3af">(' + r.realName + ')</span>' : r.page;
      var errorHtml = r.errors > 0
        ? '<div style="color:#dc2626;font-size:10px;margin-top:2px">' + r.errorNames.join(', ') + '</div>'
        : '';
      return '<tr style="' + bg + '">' +
        '<td style="padding:3px 8px;border-bottom:1px solid #e5e7eb">' + icon + ' ' + label + errorHtml + '</td>' +
        '<td style="padding:3px 8px;border-bottom:1px solid #e5e7eb;text-align:center">' + (r.sets || 0) + '</td>' +
        '<td style="padding:3px 8px;border-bottom:1px solid #e5e7eb;text-align:center">' + (r.components || 0) + '</td>' +
        '<td style="padding:3px 8px;border-bottom:1px solid #e5e7eb;text-align:center;color:' + (r.errors > 0 ? '#dc2626' : '#9ca3af') + '">' + (r.errors || 0) + '</td>' +
        '</tr>';
    }).join('');

    var totalErrors = (pageResults || []).reduce(function(sum, r) { return sum + (r.errors || 0); }, 0);
    var isFirst = batchIndex === 0;
    var isLast = batchIndex === totalBatches - 1;

    var backBtn = isFirst
      ? '<button disabled style="flex:1;padding:8px;background:#e5e7eb;color:#9ca3af;border:none;border-radius:6px;font-size:12px">← Back</button>'
      : '<button id="backBtn" style="flex:1;padding:8px;background:#f3f4f6;border:none;border-radius:6px;cursor:pointer;font-size:12px">← Back</button>';
    var nextBtn = isLast
      ? '<button disabled style="flex:1;padding:8px;background:#d1d5db;color:#6b7280;border:none;border-radius:6px;font-size:12px">Đã xong ✓</button>'
      : '<button id="nextBtn" style="flex:1;padding:8px;background:#171717;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px">Batch ' + (batchIndex+1) + ' →</button>';

    var summaryBg = totalErrors > 0 ? '#fff7ed' : '#f0fdf4';
    var summaryBorder = totalErrors > 0 ? '#fed7aa' : '#bbf7d0';
    var errorSummary = totalErrors > 0 ? ' &nbsp;|&nbsp; ⚠️ <b style="color:#dc2626">' + totalErrors + ' errors</b>' : '';

    figma.showUI(
      '<div style="font-family:sans-serif;padding:12px;font-size:12px">' +
      '<div style="font-weight:600;font-size:13px;margin-bottom:6px">Batch ' + batchIndex + '/' + (totalBatches-1) + ' — ' + parsed.pages.length + ' trang</div>' +
      '<table style="width:100%;border-collapse:collapse;margin-bottom:8px">' +
      '<thead><tr style="background:#f3f4f6">' +
      '<th style="padding:3px 8px;text-align:left">Trang</th>' +
      '<th style="padding:3px 8px">Sets</th>' +
      '<th style="padding:3px 8px">Comps</th>' +
      '<th style="padding:3px 8px;color:#dc2626">Err</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>' +
      '<div style="background:' + summaryBg + ';border:1px solid ' + summaryBorder + ';border-radius:6px;padding:8px;margin-bottom:8px">' +
      '📦 <b>' + setsCount + ' sets</b> &nbsp;|&nbsp; 🧩 <b>' + compsCount + ' components</b>' + errorSummary +
      '</div>' +
      '<textarea id="jsonOutput" style="width:100%;height:50px;font-size:10px;border:1px solid #d1d5db;border-radius:4px;padding:4px;box-sizing:border-box;margin-bottom:8px;resize:none"></textarea>' +
      '<div style="display:flex;gap:6px;margin-bottom:6px">' +
      '<button id="copyBtn" style="flex:1;padding:8px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px">📋 Copy</button>' +
      backBtn + nextBtn +
      '</div>' +
      '<button onclick="parent.postMessage({pluginMessage:{type:\'close\'}},\'*\')" style="width:100%;padding:6px;background:#f3f4f6;border:none;border-radius:6px;cursor:pointer;font-size:11px;color:#6b7280">Đóng</button>' +
      '</div>' +
      '<script>' +
      'var json=' + JSON.stringify(output) + ';' +
      'document.getElementById("jsonOutput").value=json;' +
      'document.getElementById("copyBtn").onclick=function(){' +
        'var ta=document.getElementById("jsonOutput");ta.select();ta.setSelectionRange(0,99999);document.execCommand("copy");' +
        'document.getElementById("copyBtn").textContent="✅ Copied!";' +
        'setTimeout(function(){document.getElementById("copyBtn").textContent="📋 Copy";},2000);' +
      '};' +
      'var nb=document.getElementById("nextBtn");if(nb)nb.onclick=function(){parent.postMessage({pluginMessage:{type:"next"}},"*");};' +
      'var bb=document.getElementById("backBtn");if(bb)bb.onclick=function(){parent.postMessage({pluginMessage:{type:"back"}},"*");};' +
      '<\/script>',
      { width: 440, height: 520 }
    );

    figma.ui.onmessage = function(msg) {
      if (msg.type === 'close') figma.closePlugin();
      if (msg.type === 'next' && currentBatch < totalBatches - 1) {
        currentBatch++;
        var c = cachedOutputs[currentBatch];
        if (c) showUI(currentBatch, c.pageResults, c.setsCount, c.compsCount, c.output);
        else processBatch(currentBatch);
      }
      if (msg.type === 'back' && currentBatch > 0) {
        currentBatch--;
        var c = cachedOutputs[currentBatch];
        if (c) showUI(currentBatch, c.pageResults, c.setsCount, c.compsCount, c.output);
        else processBatch(currentBatch);
      }
    };
  }

  processBatch(currentBatch);
})();