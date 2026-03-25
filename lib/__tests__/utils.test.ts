import { describe, it, expect } from "vitest"
import { cn } from "../utils"

describe("utils", () => {
  describe("cn", () => {
    it("should merge class names", () => {
      const result = cn("foo", "bar")

      expect(result).toBe("foo bar")
    })

    it("should handle conditional classes", () => {
      const isActive = true
      const result = cn("base", isActive && "active")

      expect(result).toBe("base active")
    })

    it("should handle false conditions", () => {
      const isActive = false
      const result = cn("base", isActive && "active")

      expect(result).toBe("base")
    })

    it("should merge conflicting tailwind classes", () => {
      const result = cn("bg-red-500", "bg-blue-500")

      expect(result).toBe("bg-blue-500")
    })

    it("should handle empty inputs", () => {
      const result = cn()

      expect(result).toBe("")
    })

    it("should handle undefined inputs", () => {
      const result = cn("foo", undefined, "bar")

      expect(result).toBe("foo bar")
    })

    it("should handle null inputs", () => {
      const result = cn("foo", null, "bar")

      expect(result).toBe("foo bar")
    })
  })
})
