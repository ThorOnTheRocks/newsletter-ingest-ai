type StatusBannerProps = {
  errorMessage: string
  statusMessage: string
}

export function StatusBanner({
  errorMessage,
  statusMessage,
}: StatusBannerProps) {
  return (
    <div className={`message${errorMessage ? ' error' : ''}`}>
      {errorMessage || statusMessage}
    </div>
  )
}
