const toggle = document.getElementById('toggle')
const refresh = document.getElementById('refresh')
const report = document.getElementById('report')
const options = document.getElementById('options')
const support = document.getElementById('support')
let currentTab = false

support.textContent = chrome.i18n.getMessage('menuSupport')
report.textContent = chrome.i18n.getMessage('menuReport')
options.textContent = chrome.i18n.getMessage('optionsTitle')

function reloadMenu(enable_refresh_button) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.runtime.sendMessage(
      {
        command: 'get_active_tab',
        tabId: tabs[0].id,
      },
      (message) => {
        message = message || {}
        currentTab = message.tab ? message.tab : false

        if (message.tab && message.tab.hostname) {
          toggle.textContent = chrome.i18n.getMessage(
            message.tab.whitelisted ? 'menuEnable' : 'menuDisable',
            message.tab.hostname
          )
          toggle.style.display = 'block'

          report.style.display = message.tab.whitelisted ? 'none' : 'block'
        } else {
          toggle.textContent = ''
          toggle.style.display = 'none'

          report.style.display = 'none'
        }

        if (typeof enable_refresh_button !== 'undefined') {
          refresh.style.display = 'block'
          toggle.style.display = 'none'
          report.style.display = 'none'
        }
      }
    )
  })
}

toggle.addEventListener('click', (e) => {
  chrome.runtime.sendMessage(
    {
      command: 'toggle_extension',
      tabId: currentTab.id,
    },
    (message) => {
      reloadMenu(true)
    }
  )
})

refresh.addEventListener('click', (e) => {
  chrome.runtime.sendMessage(
    {
      command: 'refresh_page',
      tabId: currentTab.id,
    },
    (message) => {
      window.close()
    }
  )
})

report.addEventListener('click', (e) => {
  chrome.runtime.sendMessage(
    {
      command: 'report_website',
      tabId: currentTab.id,
    },
    (message) => {
      window.close()
    }
  )
})

support.addEventListener('click', (e) => {
  chrome.runtime.sendMessage(
    {
      command: 'open_support_page',
    },
    (message) => {
      window.close()
    }
  )
})

options.addEventListener('click', (e) => {
  chrome.runtime.sendMessage(
    {
      command: 'open_options_page',
    },
    (message) => {
      window.close()
    }
  )
})

reloadMenu()
