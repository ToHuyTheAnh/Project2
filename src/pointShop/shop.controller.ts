import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards, // <<< Thêm UseGuards
  Req, // <<< Thêm Req
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from 'src/common/interface/authenticated-request.interface';
import { ShopService } from './shop.service';
import { CreateShopItemDto, UpdateShopItemDto } from './shop.dto';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get()
  async getShopItems() {
    const items = await this.shopService.getShopItems();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách shop items thành công',
      data: items,
    };
  }


  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createItem(
    @Body() shopItemData: CreateShopItemDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    // if (file) {
    //   shopItemData.imageUrl = `/uploads/items/${file.filename}`;
    // }
    const item = await this.shopService.createShopItem(shopItemData);

    return {
      statusCode: HttpStatus.OK,
      message: 'Tạo shop item thành công',
      data: item,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateShopItem(
    @Param('id') id: string,
    @Body() shopItemData: UpdateShopItemDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    const shopItem = await this.shopService.updateShopItem(id, shopItemData, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật shop item thành công',
      data: shopItem,
    };
  }

  @Post("buy-item/:itemId")
  @UseGuards(AuthGuard('jwt'))
  async userBuyItem(
    @Param('itemId') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    const shopItem = await this.shopService.userBuyItenm(userId, id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Mua item thành công',
      data: shopItem,
    };
  }

  @Get("user-items")
  @UseGuards(AuthGuard('jwt'))
  async getUserItems(@Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    const items = await this.shopService.getUserItems(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách shop items của người dùng thành công',
      data: items,
    };
  }

  // @Get()
  // async getShopItems(@Query('type') type?: string) {
  //   if (type) {
  //     const items = await this.shopService.getShopItemsByType(type);
  //     return {
  //       statusCode: HttpStatus.OK,
  //       message: 'Lấy danh sách shop items theo type thành công',
  //       data: items,
  //     };
  //   }

  //   const items = await this.shopService.getShopItems();
  //   return {
  //     statusCode: HttpStatus.OK,
  //     message: 'Lấy danh sách shop items thành công',
  //     data: items,
  //   };
  // }

  @Get('discount')
  async getShopItemsWithDiscount() {
    const items = await this.shopService.getShopItemsWithDiscount();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách items có giảm giá thành công',
      data: items,
    };
  }

  @Get(':id')
  async getShopItemById(@Param('id') id: string) {
    const shopItem = await this.shopService.getShopItemById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy shop item thành công',
      data: shopItem,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteShopItem(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    await this.shopService.deleteShopItem(id, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa shop item thành công',
    };
  }
}