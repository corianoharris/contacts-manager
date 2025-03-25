import { Phone, Video, Mail, User } from "lucide-react"
import { ContactStatus, CommunicationType } from "@/types/contact"

export const getStatusColor = (status: ContactStatus) => {
  switch (status) {
    case ContactStatus.ACTIVE:
    case ContactStatus.Active:
      return "bg-green-500"
    case ContactStatus.INACTIVE:
    case ContactStatus.Inactive:
      return "bg-red-500"
    case ContactStatus.PENDING:
    case ContactStatus.Pending:
      return "bg-yellow-500"
    case ContactStatus.Blocked:
      return "bg-gray-500"
    default:
      return "bg-gray-500"
  }
}

export const getCommunicationIcon = (type: CommunicationType | string) => {
  switch (type) {
    case CommunicationType.Call:
      return <Phone className="h-3 w-3" />
    case CommunicationType.Video:
      return <Video className="h-3 w-3" />
    case CommunicationType.Email:
      return <Mail className="h-3 w-3" />
    case "In Person":
    case CommunicationType.InPerson:
      return <User className="h-3 w-3" />
    default:
      return null
  }
}

