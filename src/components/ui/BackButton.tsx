import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from './Button'

export function BackButton({ style }: { style?: React.CSSProperties } = {}) {
  const navigate = useNavigate()
  return (
    <Button
      variant="secondary"
      size="sm"
      icon={<ArrowLeft size={14} />}
      onClick={() => navigate(-1)}
      style={{ marginBottom: 14, ...style }}
    >
      ย้อนกลับ
    </Button>
  )
}
