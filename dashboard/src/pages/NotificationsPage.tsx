import {useNavigate} from 'react-router-dom'
import {CheckCheck} from 'lucide-react'
import {NotificationList} from '../components/NotificationList'
import {groupNotifications, type DisplayItem} from '../lib/notificationGroups'
import {useNotificationsContext} from '../lib/notificationsContext'
import {Button, Card, PageHeader, SkeletonList} from '../components/ui'

export function NotificationsPage() {
  const {items, loaded, unreadCount, markRead, markAllRead} = useNotificationsContext()
  const navigate = useNavigate()
  const display = groupNotifications(items)

  function onSelect(item: DisplayItem) {
    if (item.type === 'group') {
      item.ids.forEach((id) => markRead(id))
      navigate(item.link)
    } else {
      if (!item.notification.is_read) markRead(item.notification.id)
      if (item.notification.link) navigate(item.notification.link)
    }
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Updates from across all your customers."
        actions={
          unreadCount > 0 && (
            <Button variant="secondary" icon={CheckCheck} onClick={markAllRead}>
              Mark all read
            </Button>
          )
        }
      />

      {!loaded ? (
        <SkeletonList rows={5} />
      ) : (
        <Card>
          <NotificationList
            items={display}
            onSelect={onSelect}
            empty="No notifications yet."
          />
        </Card>
      )}
    </div>
  )
}
