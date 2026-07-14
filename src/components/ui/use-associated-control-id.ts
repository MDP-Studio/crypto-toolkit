import * as React from "react"

type SupportedControl = HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

/**
 * Gives every shared form control a stable id and connects a sibling Label when
 * the field contains exactly one control. Explicit id/htmlFor and aria naming
 * always take precedence, so complex field groups remain opt-in.
 */
function useAssociatedControlId<T extends SupportedControl>(
  explicitId: string | undefined,
  forwardedRef: React.Ref<T> | undefined,
) {
  const generatedId = React.useId().replaceAll(":", "")
  const id = explicitId ?? `field-${generatedId}`
  const controlRef = React.useRef<T | null>(null)

  const ref = React.useCallback((node: T | null) => {
    controlRef.current = node
    assignRef(forwardedRef, node)
  }, [forwardedRef])

  React.useLayoutEffect(() => {
    const control = controlRef.current
    const container = control?.parentElement
    if (!control || !container || control.hasAttribute("aria-label") || control.hasAttribute("aria-labelledby")) {
      return
    }

    const labels = Array.from(container.children).filter(
      (child): child is HTMLLabelElement => child instanceof HTMLLabelElement,
    )
    const controls = Array.from(container.children).filter(child =>
      child.matches('input, textarea, select, button[data-slot="select-trigger"]'),
    )
    const label = labels.length === 1 && controls.length === 1 ? labels[0] : undefined

    if (label && !label.htmlFor) {
      label.htmlFor = id
    }
  }, [id])

  return { id, ref }
}

export { useAssociatedControlId }
