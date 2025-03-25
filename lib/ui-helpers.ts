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

export const getCommunicationTypeIcon = (type: CommunicationType) => {
  switch (type) {
    case CommunicationType.Call:
      return Phone
    case CommunicationType.Video:
      return Video
    case CommunicationType.InPerson:
      return User
    case CommunicationType.Email:
      return Mail
    default:
      return User
  }
}
