import { useNavigate } from 'react-router-dom'
import { FaChevronLeft } from 'react-icons/fa6'
import { Button } from './Button'

interface Props {
  to: string
  label?: string
  style?: React.CSSProperties
}

export function BackButton({ to, label = 'ย้อนกลับ', style }: Props) {
  const navigate = useNavigate()
  return (
    <Button
      variant="secondary"
      icon={<FaChevronLeft size={15} />}
      onClick={() => navigate(to)}
      style={style}
    >
      {label}
    </Button>
  )
}
