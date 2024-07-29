class Detection {
    isPhone() {
        if (this.isPhoneChecked) {
            this.isPhoneChecked = true

            this.PhoneCheck = document.documentElement.classList.contains("phone")
        }

        return this.PhoneCheck
    }

    isDesktop() {
        if (this.isDesktopChecked) {
            this.isDesktopChecked = true

            this.DesktopCheck = document.documentElement.classList.contains("desktop")
        }

        return this.DesktopCheck
    }

    isTablet() {
        if (this.isTabletChecked) {
            this.isTabletChecked = true

            this.TabletCheck = document.documentElement.classList.contains("tablet")
        }

        return this.TabletCheck
    }

}

const DetectionManager = new Detection()

export default DetectionManager

// COMPLETE