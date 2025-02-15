import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
  Renderer2,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationExtras,
  Router,
} from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { TokenStorageService } from "src/app/utility/user_service/token.service";
import { debounceTime, filter } from "rxjs/operators";
import { getUserHeaderPhase } from "src/app/utility/config/headerCode";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { FileModel } from "src/app/utility/image_avatar_service/imageUpload.component.model";
import { TourishCategory, TourishPlan } from "src/app/model/baseModel";

@Component({
  selector: "app-user-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderUserComponent implements OnDestroy {
  @ViewChild("mySidenav")
  myNameElem!: ElementRef;

  @ViewChild("notificationTab")
  nottifyTabElem!: ElementRef;

  @ViewChild("header")
  headerElem!: ElementRef;

  @ViewChild("autocompleteSearch")
  autocompleteSearch!: ElementRef;

  @ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;

  @Output() checkNavOpen = new EventEmitter<boolean>();

  isSearchLoading = false;
  activeItem = "1st";
  isNavOpen = false;
  isNotifyOpen = false;
  isAutoCompleteOpen = false;
  avatarUrl = environment.backend.blobURL + "/0-container/0_anonymus.png";

  filteredInput!: Observable<string | null>;
  searchFormGroup!: FormGroup;

  searchControl = new FormControl("");

  countNavClick = 0;
  countNotifyClick = 0;
  countSearchClick = 0;
  subscriptions: Subscription[] = [];
  tourList: TourishPlan[] = [];
  tourLength = 0;
  categoryList: TourishCategory[] = [];
  categoryLength = 0;
  notifyUnreadNumber: number = 0;

  constructor(
    private dialog: MatDialog,
    private tokenService: TokenStorageService,
    private fb: FormBuilder,
    private router: Router,
    private renderer: Renderer2,
    private _route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.filteredInput = this.searchControl.valueChanges.pipe(
      debounceTime(500)
    );
  }

  id = 0;

  ngOnInit(): void {
    this.getCategory();

    this.id = Number(localStorage.getItem("id")) ?? 0;
    this.showNotification();
    this.activeItem = getUserHeaderPhase(this.router.url.split("?")[0]);

    this.subscriptions.push(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event) => {
          if (event instanceof NavigationEnd) {
            this.activeItem =
              getUserHeaderPhase(event.url.split("?")[0]).length <= 0
                ? this.activeItem
                : getUserHeaderPhase(event.url.split("?")[0]);
          }
        })
    );

    this.subscriptions.push(
      this._route.queryParamMap.subscribe((query) => {
        if (query.get("serviceType")) {
          const serviceType = query.get("serviceType") ?? "";
          if (serviceType.length > 0) {
            if (serviceType === "moving") {
              this.activeItem = "1st";
            } else if (serviceType === "staying") {
              this.activeItem = "2nd";
            }
          }
        }

        if (query.get("category")) {
          const category = query.get("category") ?? "";
          if (category.length > 0) {
            const existCategory = this.categoryList.findIndex(
              (entity) => entity.name === category
            );
            if (existCategory > -1)
              this.activeItem = this.categoryList[existCategory].id ?? "";
          }
        }
      })
    );

    this.searchFormGroup = this.fb.group({
      searchValue: [
        "",
        Validators.compose([
          Validators.minLength(2),
          Validators.maxLength(20),
          Validators.pattern(/^[a-z]{6,32}$/i),
        ]),
      ],
    });

    this.searchFormGroup = new FormGroup({
      search: new FormControl(),
    });

    this.subscriptions.push(
      this.filteredInput.subscribe((state) => {
        if (state) {
          const params = {
            page: 1,
            search: state,
            pageSize: 4,
          };

          this.tourList = [];
          this.isSearchLoading = true;
          this.http
            .get("/api/GetTourishPlan", { params: params })
            .pipe(debounceTime(400))
            .subscribe((response: any) => {
              this.isSearchLoading = false;
              this.tourList = response.data;
              this.tourLength = this.tourList.length;
            });

          this.openAutoCompleteSearch();
        } else {
          this.closeAutoCompleteSearch();
        }
      })
    );

    this.getImageList();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  userInfo() {
    this.router.navigate(["/user/account/info"]);
  }

  tourReceipt() {
    this.router.navigate(["/user/receipt/list"]);
  }

  async signOut() {
    await this.tokenService.signOut();
    this.router.navigate(["/guest/login"]);
  }

  outsideNavClick(hasClickedOutside: any) {
    if (hasClickedOutside && this.isNavOpen) {
      this.countNavClick++;
      if (this.countNavClick >= 1) this.closeNav();
    }
  }

  outsideNotificationClick(hasClickedOutside: any) {
    if (hasClickedOutside && this.isNotifyOpen) {
      this.countNotifyClick++;
      if (this.countNotifyClick >= 2) this.closeNotificationNav();
    }
  }

  outsideAutoCompleteSearchClick(hasClickedOutside: any) {
    if (hasClickedOutside && this.isAutoCompleteOpen) {
      this.countSearchClick++;
      if (this.countSearchClick >= 1) this.closeAutoCompleteSearch();
    }
  }

  addNewItem(value: boolean) {
    this.checkNavOpen.emit(value);
  }

  openNav() {
    if (window.innerWidth >= 1000) {
      this.myNameElem.nativeElement.style.width = "340px";
      this.myNameElem.nativeElement.style["margin-right"] = "0px";
      this.myNameElem.nativeElement.style["padding-top"] = "0px";
      this.myNameElem.nativeElement.style["padding-left"] = "10px";
      this.myNameElem.nativeElement.style["padding-right"] = "10px";
      this.myNameElem.nativeElement.style["border-bottom"] =
        "2px solid #EDF1F7";
      this.myNameElem.nativeElement.style["border-right"] = "2px solid #EDF1F7";
    } else {
      this.renderer.setStyle(this.myNameElem.nativeElement, "width", "100%");
      //this.myNameElem.nativeElement.style.width = "100%";
      this.myNameElem.nativeElement.style["margin-top"] = "0px";
      this.myNameElem.nativeElement.style["margin-right"] = "0px";
      this.myNameElem.nativeElement.style["padding-top"] = "0px";
      this.myNameElem.nativeElement.style["padding-left"] = "40px";
      this.myNameElem.nativeElement.style["padding-right"] = "25px";
      this.myNameElem.nativeElement.style["border-bottom"] =
        "2px solid #EDF1F7";
      this.myNameElem.nativeElement.style["border-right"] = "2px solid #EDF1F7";
    }

    this.isNavOpen = true;
    this.addNewItem(this.isNavOpen);
  }

  closeNav() {
    this.myNameElem.nativeElement.style.width = "70px";
    this.myNameElem.nativeElement.style["margin-left"] = "0px";
    this.myNameElem.nativeElement.style["margin-right"] = "0px";
    this.myNameElem.nativeElement.style["margin-top"] = "0px";
    this.myNameElem.nativeElement.style["padding-left"] = "0px";
    this.myNameElem.nativeElement.style["padding-right"] = "0px";
    this.myNameElem.nativeElement.style["border-bottom"] = "0px solid #EDF1F7";
    this.myNameElem.nativeElement.style["border-left"] = "0px solid #EDF1F7";
    this.myNameElem.nativeElement.style["border-right"] = "0px solid #EDF1F7";

    this.headerElem.nativeElement.style["width"] = "100%";
    document.body.style.backgroundColor = "white";

    this.isNavOpen = false;
    this.countNavClick = 0;
    this.addNewItem(this.isNavOpen);
  }

  openNotificationNav() {
    if (window.innerWidth >= 1000) {
      this.nottifyTabElem.nativeElement.style.width = "420px";
      this.nottifyTabElem.nativeElement.style["margin-right"] = "0px";
      this.nottifyTabElem.nativeElement.style["padding-top"] = "0px";
      this.nottifyTabElem.nativeElement.style["padding-left"] = "0px";
      this.nottifyTabElem.nativeElement.style["padding-right"] = "0px";
      this.nottifyTabElem.nativeElement.style["border-bottom"] =
        "2px solid #EDF1F7";
      this.nottifyTabElem.nativeElement.style["border-right"] =
        "2px solid #EDF1F7";
    } else {
      this.renderer.setStyle(
        this.nottifyTabElem.nativeElement,
        "width",
        "100%"
      );
      //this.myNameElem.nativeElement.style.width = "100%";
      this.nottifyTabElem.nativeElement.style["margin-top"] = "0px";
      this.nottifyTabElem.nativeElement.style["margin-right"] = "0px";
      this.nottifyTabElem.nativeElement.style["padding-top"] = "0px";
      this.nottifyTabElem.nativeElement.style["padding-left"] = "40px";
      this.nottifyTabElem.nativeElement.style["padding-right"] = "25px";
      this.nottifyTabElem.nativeElement.style["border-bottom"] =
        "2px solid #EDF1F7";
      this.nottifyTabElem.nativeElement.style["border-right"] =
        "2px solid #EDF1F7";
    }

    this.isNotifyOpen = true;
  }

  closeNotificationNav() {
    this.nottifyTabElem.nativeElement.style.width = "0px";
    this.nottifyTabElem.nativeElement.style["margin-right"] = "0px";
    this.nottifyTabElem.nativeElement.style["margin-top"] = "0px";
    this.nottifyTabElem.nativeElement.style["padding-left"] = "0px";
    this.nottifyTabElem.nativeElement.style["padding-right"] = "0px";
    this.nottifyTabElem.nativeElement.style["border-bottom"] =
      "0px solid #EDF1F7";
    this.nottifyTabElem.nativeElement.style["border-left"] =
      "0px solid #EDF1F7";
    this.nottifyTabElem.nativeElement.style["border-right"] =
      "0px solid #EDF1F7";
    document.body.style.backgroundColor = "white";

    this.countNotifyClick = 0;
    this.isNotifyOpen = false;
  }

  openAutoCompleteSearch() {
    this.autocompleteSearch.nativeElement.style.height = "fit-content";
    this.autocompleteSearch.nativeElement.style["margin-top"] = "40px";
    this.autocompleteSearch.nativeElement.style["padding-top"] = "25px";
    this.autocompleteSearch.nativeElement.style["padding-bottom"] = "25px";
    this.autocompleteSearch.nativeElement.style["border-bottom"] =
      "2px solid #EDF1F7";
    this.autocompleteSearch.nativeElement.style["border-left"] =
      "2px solid #EDF1F7";
    this.autocompleteSearch.nativeElement.style["border-right"] =
      "2px solid #EDF1F7";
    this.isAutoCompleteOpen = true;
  }

  closeAutoCompleteSearch() {
    this.autocompleteSearch.nativeElement.style.height = "0";
    this.autocompleteSearch.nativeElement.style["padding-top"] = "0";
    this.autocompleteSearch.nativeElement.style["margin-top"] = "40px";
    this.autocompleteSearch.nativeElement.style["padding-bottom"] = "0px";
    this.autocompleteSearch.nativeElement.style["border-bottom"] =
      "0px solid #EDF1F7";
    this.autocompleteSearch.nativeElement.style["border-left"] =
      "0px solid #EDF1F7";
    this.autocompleteSearch.nativeElement.style["border-right"] =
      "0px solid #EDF1F7";
    document.body.style.backgroundColor = "white";
    this.isAutoCompleteOpen = false;
    this.countSearchClick = 0;
  }

  async navMenuClick() {
    if (this.isNavOpen) {
      await this.closeNav();
    } else if (!this.isNavOpen) {
      await this.openNav();
    }
  }

  async navigateUrl(url: string) {
    this.router.navigate(["user/" + url]);
  }

  getImageList() {
    const user = this.tokenService.getUser();
    const payload = {
      resourceId: user.Id,
      resourceType: 0,
    };

    return this.http
      .get("/api/GetFile", { params: payload })
      .subscribe((state: any) => {
        if (state.data?.length > 0) {
          this.avatarUrl = this.generateUrl(state.data[0]);
        }
        if (
          state.data == undefined ||
          state.data == null ||
          state.data.length == 0
        ) {
          this.avatarUrl =
            environment.backend.blobURL + "/0-avatar/0_anonymus.png";
        }
      });
  }

  generateUrl(image: FileModel) {
    return (
      environment.backend.blobURL +
      "/0-container/" +
      "0" +
      "_" +
      image.id +
      image.fileType
    );
  }

  getBlobUrl() {
    return environment.backend.blobURL;
  }

  formSubmit(): void {}

  showNotification(): void {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {});
    }
  }

  getTotalPrice(tourishPlan: TourishPlan): number {
    let totalPrice = 0;

    tourishPlan.stayingSchedules?.forEach((entity) => {
      totalPrice += entity.singlePrice ?? 0;
    });

    tourishPlan.eatSchedules?.forEach((entity) => {
      totalPrice += entity.singlePrice ?? 0;
    });

    tourishPlan.movingSchedules?.forEach((entity) => {
      totalPrice += entity.singlePrice ?? 0;
    });

    return totalPrice;
  }

  getCategory() {
    const params = {
      page: 1,
      pageSize: 6,
    };

    this.http
      .get("/api/GetTourCategory", { params: params })
      .subscribe((response: any) => {
        this.categoryList = response.data;

        this.categoryLength = response.count;
      });
  }

  async navigateCategoryUrl(url: string, category: string) {
    let navigationExtras: NavigationExtras = {
      queryParams: { category: category }, // Replace 'key' and 'value' with your actual query parameters
    };
    this.router.navigate(["user/" + url], navigationExtras);
    this.closeNav();
  }

  async navigateServiceUrl(url: string, type: string) {
    let navigationExtras: NavigationExtras = {
      queryParams: { serviceType: type }, // Replace 'key' and 'value' with your actual query parameters
    };
    this.router.navigate(["user/" + url], navigationExtras);
    this.closeNav();
  }

  async navigateNavUrl(url: string) {
    this.router.navigate(["user/" + url]);
    this.closeNav();
  }

  setNotifyUnread($event: number) {
    this.notifyUnreadNumber = $event;
  }

  async navigateSearchUrl(url: string) {
    let navigationExtras: NavigationExtras = {
      queryParams: { search: this.searchControl.value }, // Replace 'key' and 'value' with your actual query parameters
    };
    this.router.navigate(["user/" + url], navigationExtras);
  }

  closeSearch($event: boolean) {
    if ($event) this.closeAutoCompleteSearch();
  }

  closeNotifyInside($event: boolean) {
    if ($event) this.closeNotificationNav();
  }
}
